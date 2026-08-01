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

@Injectable()
export class PassengerBookingService {
  /**
   * Temporarily lock a seat for 10 minutes to prevent race conditions during checkout
   */
  async holdSeat(dto: HoldSeatDto, userId?: string) {
    const { schedule_id, coach_id, seat_number, origin_id, destination_id } = dto;

    if (origin_id === destination_id) {
      throw new BadRequestException('Origin and destination stations cannot be the same');
    }

    const [schedule, coach, originStation, destinationStation] = await Promise.all([
      prisma.schedule.findUnique({ where: { id: schedule_id } }),
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

    const now = new Date();

    // Check if seat is currently held (active hold where expiresAt > now) or confirmed booked
    const [existingHold, existingBooking] = await Promise.all([
      prisma.seatHold.findFirst({
        where: {
          scheduleId: schedule_id,
          coachId: coach_id,
          seatNumber: seat_number,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
      }),
      prisma.booking.findFirst({
        where: {
          scheduleId: schedule_id,
          coachId: coach_id,
          seatNumber: seat_number,
          status: 'CONFIRMED',
        },
      }),
    ]);

    if (existingHold || existingBooking) {
      throw new ConflictException(
        `Seat ${seat_number} in coach "${coach.identifier}" is currently locked or booked by another passenger`,
      );
    }

    // Set hold expiry for 10 minutes
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const hold = await prisma.seatHold.create({
      data: {
        scheduleId: schedule_id,
        coachId: coach_id,
        seatNumber: seat_number,
        originStationId: origin_id,
        destinationStationId: destination_id,
        userId: userId ?? null,
        status: 'ACTIVE',
        expiresAt,
      },
    });

    return {
      hold_id: hold.id,
      schedule_id: hold.scheduleId,
      coach_id: hold.coachId,
      seat_number: hold.seatNumber,
      origin_station: { id: originStation.id, name: originStation.name, code: originStation.code },
      destination_station: { id: destinationStation.id, name: destinationStation.name, code: destinationStation.code },
      expires_at: hold.expiresAt.toISOString(),
      message: 'Seat locked successfully for 10 minutes',
    };
  }

  /**
   * Confirm booking, generate PNR reference, and calculate final segment-based fare
   */
  async confirmBooking(dto: ConfirmBookingDto, userId?: string) {
    const { hold_id, passenger_details } = dto;

    const hold = await prisma.seatHold.findUnique({
      where: { id: hold_id },
      include: {
        schedule: {
          include: {
            line: { include: { startStation: true, endStation: true } },
            train: true,
          },
        },
        coach: true,
        originStation: true,
        destinationStation: true,
      },
    });

    if (!hold) {
      throw new NotFoundException(`Seat hold with ID "${hold_id}" not found`);
    }

    const now = new Date();
    if (hold.status !== 'ACTIVE' || hold.expiresAt <= now) {
      throw new BadRequestException(
        'Seat hold has expired or is invalid. Please select and hold your seat again.',
      );
    }

    // Calculate segment-based fare based on distance & coach class
    const fareAmount = await this.calculateSegmentFare(
      hold.schedule.lineId,
      hold.originStationId,
      hold.destinationStationId,
      hold.coach.isReserved,
    );

    // Generate unique booking reference (PNR-XXXXXX)
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const pnr = `PNR-${randomSuffix}`;

    const booking = await prisma.$transaction(async (tx) => {
      await tx.seatHold.update({
        where: { id: hold_id },
        data: { status: 'CONFIRMED' },
      });

      return tx.booking.create({
        data: {
          bookingReference: pnr,
          scheduleId: hold.scheduleId,
          coachId: hold.coachId,
          seatNumber: hold.seatNumber,
          originStationId: hold.originStationId,
          destinationStationId: hold.destinationStationId,
          passengerName: passenger_details.name,
          passengerEmail: passenger_details.email.toLowerCase(),
          passengerPhone: passenger_details.phone ?? null,
          userId: userId ?? hold.userId ?? null,
          fareAmount,
          status: 'CONFIRMED',
        },
        include: {
          schedule: {
            include: {
              line: { include: { startStation: true, endStation: true } },
              train: true,
            },
          },
          coach: true,
          originStation: true,
          destinationStation: true,
        },
      });
    });

    return this.formatTicketResponse(booking);
  }

  /**
   * Retrieve confirmed ticket details by booking ID or PNR reference
   */
  async getBookingDetails(idOrRef: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: idOrRef },
          { bookingReference: idOrRef },
        ],
      },
      include: {
        schedule: {
          include: {
            line: { include: { startStation: true, endStation: true } },
            train: true,
          },
        },
        coach: true,
        originStation: true,
        destinationStation: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with reference or ID "${idOrRef}" not found`);
    }

    return this.formatTicketResponse(booking);
  }

  /**
   * Segment-based fare calculation algorithm:
   * Fare = Max(Minimum Base Fare, Distance (km) * Rate Per Km)
   */
  private async calculateSegmentFare(
    lineId: string,
    originStationId: string,
    destinationStationId: string,
    isReservedCoach: boolean,
  ): Promise<number> {
    const lineStations = await prisma.lineStation.findMany({
      where: { lineId },
    });

    const line = await prisma.line.findUnique({
      where: { id: lineId },
      select: { startStationId: true, endStationId: true },
    });

    let originDist = 0;
    let destDist = 0;

    if (originStationId === line?.startStationId) {
      originDist = 0;
    } else {
      const match = lineStations.find((ls) => ls.stationId === originStationId);
      originDist = match?.distanceFromStart ?? 0;
    }

    if (destinationStationId === line?.startStationId) {
      destDist = 0;
    } else {
      const match = lineStations.find((ls) => ls.stationId === destinationStationId);
      destDist = match?.distanceFromStart ?? (originDist + 100);
    }

    const distanceKm = Math.abs(destDist - originDist);

    // Segment fare parameters
    const ratePerKm = isReservedCoach ? 20.00 : 10.00;
    const minFare = isReservedCoach ? 500.00 : 200.00;

    const calculatedFare = distanceKm > 0 ? distanceKm * ratePerKm : (isReservedCoach ? 2500.00 : 1500.00);

    return Math.round(Math.max(minFare, calculatedFare) * 100) / 100;
  }

  /**
   * Format Prisma Booking object into clean ticket response payload
   */
  private formatTicketResponse(b: any) {
    return {
      booking_id: b.id,
      booking_reference: b.bookingReference,
      status: b.status,
      fare_amount: b.fareAmount,
      passenger: {
        name: b.passengerName,
        email: b.passengerEmail,
        phone: b.passengerPhone,
      },
      journey_details: {
        schedule_id: b.scheduleId,
        train_name: b.schedule.train.name,
        train_number: b.schedule.train.trainNumber,
        line_name: b.schedule.line.name,
        origin_station: {
          id: b.originStation.id,
          name: b.originStation.name,
          code: b.originStation.code,
        },
        destination_station: {
          id: b.destinationStation.id,
          name: b.destinationStation.name,
          code: b.destinationStation.code,
        },
        departure_time: b.schedule.departureTime.toISOString(),
        arrival_time: b.schedule.arrivalTime.toISOString(),
      },
      seat_details: {
        coach_id: b.coachId,
        coach_identifier: b.coach.identifier,
        seat_number: b.seatNumber,
        is_reserved_class: b.coach.isReserved,
      },
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }
}
