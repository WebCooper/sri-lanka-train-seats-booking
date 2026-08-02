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
  LineWithStations,
} from '../../common/line-segment.util';
import { SegmentAllocationService } from '../../common/segment-allocation.service';

type CoachRecord = {
  id: string;
  seatCount: number;
  isReserved: boolean;
  identifier: string;
  coachClass: string;
  seatConfiguration: string;
};

type ScheduleWithRelations = Awaited<
  ReturnType<PassengerScheduleService['fetchScheduleById']>
>;

@Injectable()
export class PassengerScheduleService {
  constructor(private readonly segmentAllocation: SegmentAllocationService) {}

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
   * Search for train schedules with date, origin, and destination.
   * Returns only schedules that have at least one available reserved seat on the segment.
   */
  async searchSchedules(query: SearchScheduleDto) {
    const { date, origin_id, destination_id } = query;

    if (origin_id === destination_id) {
      throw new BadRequestException('Origin and Destination stations cannot be the same');
    }

    const { startDate, endDate } = this.resolveDateRange(date);

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

    const originStation = { id: origin.id, name: origin.name, code: origin.code };
    const destinationStation = {
      id: destination.id,
      name: destination.name,
      code: destination.code,
    };

    const allLines = await prisma.line.findMany({
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' },
        },
      },
    });

    const validLineIds = findValidLineIds(allLines, origin_id, destination_id);

    if (validLineIds.length === 0) {
      return this.buildSearchResponse({
        date: startDate,
        originStation,
        destinationStation,
        schedules: [],
      });
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        lineId: { in: validLineIds },
        departureTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { departureTime: 'asc' },
      include: this.scheduleInclude,
    });

    const formattedSchedules: ReturnType<PassengerScheduleService['formatScheduleItem']>[] = [];

    for (const schedule of schedules) {
      const line = schedule.line;
      const reservedCoaches = this.getReservedCoaches(schedule.train.coaches);
      const hasAvailableSeat = await this.hasAvailableReservedSeat(
        schedule.id,
        line,
        origin_id,
        destination_id,
        reservedCoaches,
      );

      if (!hasAvailableSeat) {
        continue;
      }

      formattedSchedules.push(
        this.formatScheduleItem(schedule, {
          originId: origin_id,
          destinationId: destination_id,
        }),
      );
    }

    return this.buildSearchResponse({
      date: startDate,
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

    const occupancies = await this.segmentAllocation.fetchBlockingAllocations(scheduleId);
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
        const isOccupied = this.segmentAllocation.hasSeatSegmentConflict(
          coach.id,
          seatNo,
          querySegment.originPos,
          querySegment.destPos,
          occupancies,
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
        coach_class: coach.coachClass,
        seat_configuration: coach.seatConfiguration,
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

  private resolveDateRange(date: string) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private getReservedCoaches(
    trainCoaches: Array<{ coach: CoachRecord }>,
  ): CoachRecord[] {
    return trainCoaches
      .map((tc) => tc.coach)
      .filter((coach) => coach.isReserved && coach.seatCount > 0);
  }

  private async hasAvailableReservedSeat(
    scheduleId: string,
    line: LineWithStations,
    originId: string,
    destId: string,
    reservedCoaches: CoachRecord[],
  ): Promise<boolean> {
    if (reservedCoaches.length === 0) {
      return false;
    }

    const sequence = buildStationSequence(line);
    const querySegment = getSegmentPositions(sequence, originId, destId);

    if (!querySegment) {
      return false;
    }

    const occupancies = await this.segmentAllocation.fetchBlockingAllocations(scheduleId);

    for (const coach of reservedCoaches) {
      for (let seatNo = 1; seatNo <= coach.seatCount; seatNo++) {
        const isOccupied = this.segmentAllocation.hasSeatSegmentConflict(
          coach.id,
          seatNo,
          querySegment.originPos,
          querySegment.destPos,
          occupancies,
        );

        if (!isOccupied) {
          return true;
        }
      }
    }

    return false;
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

    const occupancies = await this.segmentAllocation.fetchBlockingAllocations(scheduleId);
    let availableCount = 0;

    for (const coach of reservedCoaches) {
      for (let seatNo = 1; seatNo <= coach.seatCount; seatNo++) {
        const isOccupied = this.segmentAllocation.hasSeatSegmentConflict(
          coach.id,
          seatNo,
          querySegment.originPos,
          querySegment.destPos,
          occupancies,
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
      availableReservedSeats?: number;
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
      ...(options.availableReservedSeats !== undefined
        ? { available_reserved_seats_count: options.availableReservedSeats }
        : { has_available_seats: true }),
      segment: {
        origin_id: options.originId,
        destination_id: options.destinationId,
      },
    };
  }

  private buildSearchResponse(params: {
    date: Date;
    originStation: { id: string; name: string; code: string };
    destinationStation: { id: string; name: string; code: string };
    schedules: ReturnType<PassengerScheduleService['formatScheduleItem']>[];
  }) {
    return {
      date: params.date.toISOString().slice(0, 10),
      origin: params.originStation,
      destination: params.destinationStation,
      total_schedules: params.schedules.length,
      schedules: params.schedules,
    };
  }
}
