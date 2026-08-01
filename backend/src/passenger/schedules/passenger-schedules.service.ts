import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { SearchScheduleDto } from '../dto/search-schedule.dto';
import { QuerySeatsDto } from '../dto/query-seats.dto';
import {
  buildStationSequence,
  findValidLineIds,
  getSegmentPositions,
  isSeatOccupiedForSegment,
  LineWithStations,
  SegmentOccupancy,
} from '../../common/line-segment.util';

type CoachRecord = {
  id: string;
  seatCount: number;
  isReserved: boolean;
  identifier: string;
};

type ScheduleWithRelations = Awaited<
  ReturnType<PassengerScheduleService['fetchScheduleById']>
>;

@Injectable()
export class PassengerScheduleService {
  private readonly scheduleInclude = {
    line: {
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' as const },
        },
      },
    },
    train: {
      include: {
        coaches: {
          orderBy: { position: 'asc' as const },
          include: { coach: true },
        },
      },
    },
  };

  /**
   * Return the next scheduled trains after the current system time.
   */
  async getUpcomingSchedules(limit = 5) {
    const now = new Date();

    const schedules = await prisma.schedule.findMany({
      where: {
        departureTime: { gt: now },
      },
      orderBy: { departureTime: 'asc' },
      take: limit,
      include: this.scheduleInclude,
    });

    const formatted = await Promise.all(
      schedules.map(async (schedule) => {
        const line = schedule.line;
        const reservedCoaches = this.getReservedCoaches(schedule.train.coaches);
        const availableReservedSeats = await this.countAvailableReservedSeats(
          schedule.id,
          line,
          line.startStationId,
          line.endStationId,
          reservedCoaches,
        );

        return this.formatScheduleItem(schedule, {
          originId: line.startStationId,
          destinationId: line.endStationId,
          availableReservedSeats,
        });
      }),
    );

    return {
      as_of: now.toISOString(),
      total: formatted.length,
      schedules: formatted,
    };
  }

  /**
   * Search for train schedules with optional filters.
   */
  async searchSchedules(query: SearchScheduleDto) {
    const {
      date,
      date_from,
      date_to,
      origin_id,
      destination_id,
      line_id,
      train_id,
      train_name,
    } = query;

    if (origin_id && destination_id && origin_id === destination_id) {
      throw new BadRequestException('Origin and Destination stations cannot be the same');
    }

    if ((origin_id && !destination_id) || (!origin_id && destination_id)) {
      throw new BadRequestException('Both origin_id and destination_id are required when filtering by route');
    }

    const { startDate, endDate } = this.resolveDateRange(date, date_from, date_to);

    let originStation: { id: string; name: string; code: string } | null = null;
    let destinationStation: { id: string; name: string; code: string } | null = null;

    if (origin_id && destination_id) {
      const [origin, destination] = await Promise.all([
        prisma.station.findUnique({ where: { id: origin_id } }),
        prisma.station.findUnique({ where: { id: destination_id } }),
      ]);

      if (!origin) {
        throw new NotFoundException(`Origin station with ID "${origin_id}" not found`);
      }
      if (!destination) {
        throw new NotFoundException(`Destination station with ID "${destination_id}" not found`);
      }

      originStation = { id: origin.id, name: origin.name, code: origin.code };
      destinationStation = {
        id: destination.id,
        name: destination.name,
        code: destination.code,
      };
    }

    const allLines = await prisma.line.findMany({
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' },
        },
      },
    });

    let validLineIds: string[] | null = null;

    if (origin_id && destination_id) {
      validLineIds = findValidLineIds(allLines, origin_id, destination_id);

      if (validLineIds.length === 0) {
        return this.buildSearchResponse({
          startDate,
          endDate,
          originStation,
          destinationStation,
          schedules: [],
        });
      }
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(validLineIds ? { lineId: { in: validLineIds } } : {}),
        ...(line_id ? { lineId: line_id } : {}),
        ...(train_id ? { trainId: train_id } : {}),
        ...(train_name
          ? {
              train: {
                name: { contains: train_name.trim(), mode: 'insensitive' },
              },
            }
          : {}),
        departureTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { departureTime: 'asc' },
      include: this.scheduleInclude,
    });

    const formattedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const line = schedule.line;
        const segmentOriginId = origin_id ?? line.startStationId;
        const segmentDestId = destination_id ?? line.endStationId;
        const reservedCoaches = this.getReservedCoaches(schedule.train.coaches);
        const availableReservedSeats = await this.countAvailableReservedSeats(
          schedule.id,
          line,
          segmentOriginId,
          segmentDestId,
          reservedCoaches,
        );

        return this.formatScheduleItem(schedule, {
          originId: segmentOriginId,
          destinationId: segmentDestId,
          availableReservedSeats,
        });
      }),
    );

    return this.buildSearchResponse({
      startDate,
      endDate,
      originStation,
      destinationStation,
      schedules: formattedSchedules,
    });
  }

  /**
   * View available seats for a specific leg of the journey (reserved coaches only).
   */
  async getSeatAvailability(scheduleId: string, query: QuerySeatsDto) {
    const { origin_id, destination_id } = query;

    if (origin_id === destination_id) {
      throw new BadRequestException('Origin and Destination stations cannot be the same');
    }

    const schedule = await this.fetchScheduleById(scheduleId);

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID "${scheduleId}" not found`);
    }

    const line = schedule.line;
    const sequence = buildStationSequence(line);
    const querySegment = getSegmentPositions(sequence, origin_id, destination_id);

    if (!querySegment) {
      throw new BadRequestException(
        'Origin must come before destination on this train line',
      );
    }

    const occupancies = await this.fetchSegmentOccupancies(scheduleId);
    const reservedTrainCoaches = schedule.train.coaches.filter(
      (tc) => tc.coach.isReserved && tc.coach.seatCount > 0,
    );

    const coachesData = reservedTrainCoaches.map((tc) => {
      const coach = tc.coach;
      const seats: Array<{
        seat_number: number;
        is_available: boolean;
        is_reserved: boolean;
      }> = [];

      for (let seatNo = 1; seatNo <= coach.seatCount; seatNo++) {
        const isOccupied = occupancies.some(
          (occ) =>
            occ.coachId === coach.id &&
            occ.seatNumber === seatNo &&
            isSeatOccupiedForSegment(
              sequence,
              querySegment.originPos,
              querySegment.destPos,
              occ,
            ),
        );

        seats.push({
          seat_number: seatNo,
          is_available: !isOccupied,
          is_reserved: coach.isReserved,
        });
      }

      const availableCount = seats.filter((s) => s.is_available).length;

      return {
        coach_id: coach.id,
        identifier: coach.identifier,
        position: tc.position,
        seat_count: coach.seatCount,
        available_seats_count: availableCount,
        is_reserved: coach.isReserved,
        seats,
      };
    });

    const [originStation, destinationStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: origin_id } }),
      prisma.station.findUnique({ where: { id: destination_id } }),
    ]);

    return {
      schedule_id: schedule.id,
      train: {
        id: schedule.train.id,
        name: schedule.train.name,
        train_number: schedule.train.trainNumber,
      },
      line: {
        id: line.id,
        name: line.name,
      },
      origin: originStation
        ? { id: originStation.id, name: originStation.name, code: originStation.code }
        : null,
      destination: destinationStation
        ? {
            id: destinationStation.id,
            name: destinationStation.name,
            code: destinationStation.code,
          }
        : null,
      departure_time: schedule.departureTime,
      arrival_time: schedule.arrivalTime,
      available_reserved_seats_count: coachesData.reduce(
        (sum, coach) => sum + coach.available_seats_count,
        0,
      ),
      coaches: coachesData,
    };
  }

  private async fetchScheduleById(scheduleId: string) {
    return prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: this.scheduleInclude,
    });
  }

  private resolveDateRange(date?: string, dateFrom?: string, dateTo?: string) {
    const resolvedFrom = dateFrom ?? date;
    const resolvedTo = dateTo ?? date ?? dateFrom;

    if (!resolvedFrom || !resolvedTo) {
      throw new BadRequestException(
        'Provide date or both date_from and date_to for schedule search',
      );
    }

    const startDate = new Date(resolvedFrom);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(resolvedTo);
    endDate.setUTCHours(23, 59, 59, 999);

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException('date_from cannot be after date_to');
    }

    return { startDate, endDate };
  }

  private getReservedCoaches(
    trainCoaches: Array<{ coach: CoachRecord }>,
  ): CoachRecord[] {
    return trainCoaches
      .map((tc) => tc.coach)
      .filter((coach) => coach.isReserved && coach.seatCount > 0);
  }

  private async fetchSegmentOccupancies(
    scheduleId: string,
  ): Promise<SegmentOccupancy[]> {
    const now = new Date();

    const [activeHolds, confirmedBookings] = await Promise.all([
      prisma.seatHold.findMany({
        where: {
          scheduleId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        select: {
          coachId: true,
          seatNumber: true,
          originStationId: true,
          destinationStationId: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          scheduleId,
          status: 'CONFIRMED',
        },
        select: {
          coachId: true,
          seatNumber: true,
          originStationId: true,
          destinationStationId: true,
        },
      }),
    ]);

    return [...activeHolds, ...confirmedBookings];
  }

  private async countAvailableReservedSeats(
    scheduleId: string,
    line: LineWithStations,
    originId: string,
    destId: string,
    reservedCoaches: CoachRecord[],
  ): Promise<number> {
    if (reservedCoaches.length === 0) {
      return 0;
    }

    const sequence = buildStationSequence(line);
    const querySegment = getSegmentPositions(sequence, originId, destId);

    if (!querySegment) {
      return 0;
    }

    const occupancies = await this.fetchSegmentOccupancies(scheduleId);
    let availableCount = 0;

    for (const coach of reservedCoaches) {
      for (let seatNo = 1; seatNo <= coach.seatCount; seatNo++) {
        const isOccupied = occupancies.some(
          (occ) =>
            occ.coachId === coach.id &&
            occ.seatNumber === seatNo &&
            isSeatOccupiedForSegment(
              sequence,
              querySegment.originPos,
              querySegment.destPos,
              occ,
            ),
        );

        if (!isOccupied) {
          availableCount++;
        }
      }
    }

    return availableCount;
  }

  private formatScheduleItem(
    schedule: NonNullable<ScheduleWithRelations>,
    options: {
      originId: string;
      destinationId: string;
      availableReservedSeats: number;
    },
  ) {
    const departure = new Date(schedule.departureTime);
    const arrival = new Date(schedule.arrivalTime);
    const durationMinutes = Math.round(
      (arrival.getTime() - departure.getTime()) / (1000 * 60),
    );
    const reservedCoaches = this.getReservedCoaches(schedule.train.coaches);
    const totalReservedSeats = reservedCoaches.reduce(
      (sum, coach) => sum + coach.seatCount,
      0,
    );

    return {
      schedule_id: schedule.id,
      train: {
        id: schedule.train.id,
        name: schedule.train.name,
        train_number: schedule.train.trainNumber,
      },
      line: {
        id: schedule.line.id,
        name: schedule.line.name,
        start_station: {
          id: schedule.line.startStation.id,
          name: schedule.line.startStation.name,
          code: schedule.line.startStation.code,
        },
        end_station: {
          id: schedule.line.endStation.id,
          name: schedule.line.endStation.name,
          code: schedule.line.endStation.code,
        },
      },
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      travel_date: departure.toISOString().slice(0, 10),
      duration_minutes: durationMinutes,
      total_reserved_seat_capacity: totalReservedSeats,
      available_reserved_seats_count: options.availableReservedSeats,
      segment: {
        origin_id: options.originId,
        destination_id: options.destinationId,
      },
    };
  }

  private buildSearchResponse(params: {
    startDate: Date;
    endDate: Date;
    originStation: { id: string; name: string; code: string } | null;
    destinationStation: { id: string; name: string; code: string } | null;
    schedules: ReturnType<PassengerScheduleService['formatScheduleItem']>[];
  }) {
    return {
      date_from: params.startDate.toISOString().slice(0, 10),
      date_to: params.endDate.toISOString().slice(0, 10),
      origin: params.originStation,
      destination: params.destinationStation,
      total_schedules: params.schedules.length,
      schedules: params.schedules,
    };
  }
}
