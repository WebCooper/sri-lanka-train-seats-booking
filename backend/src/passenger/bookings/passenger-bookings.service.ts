import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import * as crypto from 'crypto';
import { HoldSeatDto } from '../dto/hold-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { FareQuoteRequestDto } from '../dto/fare-quote.dto';
import { FareCalculationService } from '../../common/fare-calculation.service';
import {
  ALLOCATION_STATUS,
  SegmentAllocationService,
} from '../../common/segment-allocation.service';
import type { LineWithStations } from '../../common/line-segment.util';

@Injectable()
export class PassengerBookingService {
  constructor(
    private readonly fareCalculation: FareCalculationService,
    private readonly segmentAllocation: SegmentAllocationService,
  ) {}

  private buildLineWithStations(
    line: {
      id: string;
      startStationId: string;
      endStationId: string;
      stations: Array<{ stationId: string; position: number }>;
    },
  ): LineWithStations {
    return {
      id: line.id,
      startStationId: line.startStationId,
      endStationId: line.endStationId,
      stations: line.stations.map((station) => ({
        stationId: station.stationId,
        position: station.position,
      })),
    };
  }

  private allocationInclude() {
    return {
      schedule: {
        include: {
          line: {
            include: {
              stations: true,
              startStation: true,
              endStation: true,
            },
          },
          train: true,
        },
      },
      coach: true,
      originStation: true,
      destinationStation: true,
    };
  }

  /**
   * Temporarily lock a seat for 10 minutes to prevent race conditions during checkout
   */
  async holdSeat(dto: HoldSeatDto, userId?: string) {
    const { schedule_id, coach_id, seat_number, origin_id, destination_id } = dto;

    if (origin_id === destination_id) {
      throw new BadRequestException('Origin and destination stations cannot be the same');
    }

    await this.segmentAllocation.expireStaleHolds(schedule_id);

    const [schedule, coach, originStation, destinationStation] = await Promise.all([
      prisma.schedule.findUnique({
        where: { id: schedule_id },
        include: {
          line: {
            include: {
              stations: true,
            },
          },
        },
      }),
      prisma.coach.findUnique({ where: { id: coach_id } }),
      prisma.station.findUnique({ where: { id: origin_id } }),
      prisma.station.findUnique({ where: { id: destination_id } }),
    ]);

    if (!schedule) {
      throw new NotFoundException(`Schedule session with ID "${schedule_id}" not found`);
    }
    if (!coach) {
      throw new NotFoundException(`Coach with ID "${coach_id}" not found`);
    }
    if (!originStation) {
      throw new NotFoundException(`Origin station with ID "${origin_id}" not found`);
    }
    if (!destinationStation) {
      throw new NotFoundException(`Destination station with ID "${destination_id}" not found`);
    }

    if (seat_number > coach.seatCount) {
      throw new BadRequestException(
        `Seat number ${seat_number} exceeds coach capacity of ${coach.seatCount}`,
      );
    }

    const line = this.buildLineWithStations(schedule.line);
    const segmentPositions = this.segmentAllocation.resolveSegmentPositions(
      line,
      origin_id,
      destination_id,
    );

    if (!segmentPositions) {
      throw new BadRequestException(
        'Origin must come before destination on this train line',
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let hold;
    try {
      hold = await prisma.seatSegmentAllocation.create({
        data: {
          scheduleId: schedule_id,
          coachId: coach_id,
          seatNumber: seat_number,
          originStationId: origin_id,
          destinationStationId: destination_id,
          originPosition: segmentPositions.originPos,
          destinationPosition: segmentPositions.destPos,
          status: ALLOCATION_STATUS.ACTIVE,
          expiresAt,
          userId: userId ?? null,
        },
      });
    } catch (error) {
      if (this.segmentAllocation.isExclusionConstraintViolation(error)) {
        throw new ConflictException(
          `Seat ${seat_number} in coach "${coach.identifier}" overlaps an existing hold or booking on this schedule segment`,
        );
      }
      throw error;
    }

    const fareQuote = await this.fareCalculation.calculateSegmentFareQuote(
      schedule.lineId,
      origin_id,
      destination_id,
      coach.coachClass,
      schedule.departureTime,
    );

    return {
      hold_id: hold.id,
      schedule_id: hold.scheduleId,
      coach_id: hold.coachId,
      seat_number: hold.seatNumber,
      origin_station: { id: originStation.id, name: originStation.name, code: originStation.code },
      destination_station: {
        id: destinationStation.id,
        name: destinationStation.name,
        code: destinationStation.code,
      },
      expires_at: hold.expiresAt?.toISOString(),
      fare_quote: {
        ...fareQuote,
        currency: 'LKR',
      },
      message: 'Seat locked successfully for 10 minutes',
    };
  }

  /**
   * Confirm booking, generate PNR reference, and calculate final segment-based fare
   */
  async confirmBooking(dto: ConfirmBookingDto, userId?: string) {
    const { hold_id, passenger_details } = dto;

    const hold = await prisma.seatSegmentAllocation.findUnique({
      where: { id: hold_id },
      include: this.allocationInclude(),
    });

    if (!hold) {
      throw new NotFoundException(`Seat hold with ID "${hold_id}" not found`);
    }

    const now = new Date();
    if (
      hold.status !== ALLOCATION_STATUS.ACTIVE ||
      !hold.expiresAt ||
      hold.expiresAt <= now
    ) {
      throw new BadRequestException(
        'Seat hold has expired or is invalid. Please select and hold your seat again.',
      );
    }

    const fareQuote = await this.fareCalculation.calculateSegmentFareQuote(
      hold.schedule.lineId,
      hold.originStationId,
      hold.destinationStationId,
      hold.coach.coachClass,
      hold.schedule.departureTime,
    );
    const fareAmount = fareQuote.fare_amount;

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const pnr = `PNR-${randomSuffix}`;

    try {
      const booking = await prisma.$transaction(async (tx) => {
        await tx.seatSegmentAllocation.updateMany({
          where: {
            status: ALLOCATION_STATUS.ACTIVE,
            expiresAt: { lte: now },
          },
          data: { status: ALLOCATION_STATUS.EXPIRED },
        });

        const updated = await tx.seatSegmentAllocation.updateMany({
          where: {
            id: hold_id,
            status: ALLOCATION_STATUS.ACTIVE,
            expiresAt: { gt: now },
          },
          data: {
            status: ALLOCATION_STATUS.CONFIRMED,
            expiresAt: null,
            bookingReference: pnr,
            passengerName: passenger_details.name,
            passengerEmail: passenger_details.email.toLowerCase(),
            passengerPhone: passenger_details.phone ?? null,
            userId: userId ?? hold.userId ?? null,
            fareAmount,
          },
        });

        if (updated.count === 0) {
          throw new BadRequestException(
            'Seat hold has expired or is invalid. Please select and hold your seat again.',
          );
        }

        return tx.seatSegmentAllocation.findUniqueOrThrow({
          where: { id: hold_id },
          include: this.allocationInclude(),
        });
      });

      return this.formatTicketResponse(booking);
    } catch (error) {
      if (this.segmentAllocation.isExclusionConstraintViolation(error)) {
        throw new ConflictException(
          `Seat ${hold.seatNumber} in coach "${hold.coach.identifier}" overlaps another active hold or confirmed booking on this schedule segment`,
        );
      }
      throw error;
    }
  }

  /**
   * List confirmed bookings for a passenger (by account id or booking email).
   */
  async listUserBookings(userId: string, userEmail?: string) {
    const email = userEmail?.trim().toLowerCase();

    const bookings = await prisma.seatSegmentAllocation.findMany({
      where: {
        status: ALLOCATION_STATUS.CONFIRMED,
        OR: [
          { userId },
          ...(email ? [{ passengerEmail: email }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: this.allocationInclude(),
    });

    return {
      total: bookings.length,
      bookings: bookings.map((booking) => this.formatTicketResponse(booking)),
    };
  }

  /**
   * Retrieve confirmed ticket details by allocation ID or PNR reference
   */
  async getBookingDetails(idOrRef: string) {
    const booking = await prisma.seatSegmentAllocation.findFirst({
      where: {
        status: ALLOCATION_STATUS.CONFIRMED,
        OR: [{ id: idOrRef }, { bookingReference: idOrRef }],
      },
      include: this.allocationInclude(),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with reference or ID "${idOrRef}" not found`);
    }

    return this.formatTicketResponse(booking);
  }

  async quoteFare(dto: FareQuoteRequestDto) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: dto.schedule_id },
      include: { line: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule session with ID "${dto.schedule_id}" not found`);
    }

    if (dto.origin_station_id === dto.destination_station_id) {
      throw new BadRequestException('Origin and destination stations cannot be the same');
    }

    const breakdown = await this.fareCalculation.calculateSegmentFareQuote(
      schedule.lineId,
      dto.origin_station_id,
      dto.destination_station_id,
      dto.coach_class,
      schedule.departureTime,
    );

    return {
      ...breakdown,
      currency: 'LKR',
      schedule_id: dto.schedule_id,
      departure_time: schedule.departureTime.toISOString(),
    };
  }

  private formatTicketResponse(allocation: {
    id: string;
    bookingReference: string | null;
    status: string;
    fareAmount: number;
    passengerName: string | null;
    passengerEmail: string | null;
    passengerPhone: string | null;
    scheduleId: string;
    coachId: string;
    seatNumber: number;
    createdAt: Date;
    updatedAt: Date;
    schedule: {
      departureTime: Date;
      arrivalTime: Date;
      train: { name: string; trainNumber: string };
      line: { name: string };
    };
    coach: { identifier: string; isReserved: boolean; coachClass: string };
    originStation: { id: string; name: string; code: string };
    destinationStation: { id: string; name: string; code: string };
  }) {
    return {
      booking_id: allocation.id,
      booking_reference: allocation.bookingReference,
      status: allocation.status,
      fare_amount: allocation.fareAmount,
      passenger: {
        name: allocation.passengerName,
        email: allocation.passengerEmail,
        phone: allocation.passengerPhone,
      },
      journey_details: {
        schedule_id: allocation.scheduleId,
        train_name: allocation.schedule.train.name,
        train_number: allocation.schedule.train.trainNumber,
        line_name: allocation.schedule.line.name,
        origin_station: {
          id: allocation.originStation.id,
          name: allocation.originStation.name,
          code: allocation.originStation.code,
        },
        destination_station: {
          id: allocation.destinationStation.id,
          name: allocation.destinationStation.name,
          code: allocation.destinationStation.code,
        },
        departure_time: allocation.schedule.departureTime.toISOString(),
        arrival_time: allocation.schedule.arrivalTime.toISOString(),
      },
      seat_details: {
        coach_id: allocation.coachId,
        coach_identifier: allocation.coach.identifier,
        seat_number: allocation.seatNumber,
        is_reserved_class: allocation.coach.isReserved,
        coach_class: allocation.coach.coachClass,
      },
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    };
  }
}
