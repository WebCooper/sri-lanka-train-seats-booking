import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { SearchScheduleDto } from '../dto/search-schedule.dto';
import { QuerySeatsDto } from '../dto/query-seats.dto';

@Injectable()
export class PassengerScheduleService {
  /**
   * Search for available train schedules matching travel date, origin, and destination
   */
  async searchSchedules(query: SearchScheduleDto) {
    const { date, origin_id, destination_id } = query;

    if (origin_id === destination_id) {
      throw new BadRequestException('Origin and Destination stations cannot be the same');
    }

    const [originStation, destinationStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: origin_id } }),
      prisma.station.findUnique({ where: { id: destination_id } }),
    ]);

    if (!originStation) {
      throw new NotFoundException(`Origin station with ID "${origin_id}" not found`);
    }
    if (!destinationStation) {
      throw new NotFoundException(`Destination station with ID "${destination_id}" not found`);
    }

    // Find lines containing both stations in valid travel direction
    const allLines = await prisma.line.findMany({
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' },
          include: { station: true },
        },
      },
    });

    const validLineIds: string[] = [];

    for (const line of allLines) {
      // Build full ordered station sequence: [startStation, ...intermediates, endStation]
      const stationSequence = [
        { id: line.startStationId, position: -1 },
        ...line.stations.map((s) => ({ id: s.stationId, position: s.position })),
        { id: line.endStationId, position: 999999 },
      ];

      const originIndex = stationSequence.findIndex((s) => s.id === origin_id);
      const destIndex = stationSequence.findIndex((s) => s.id === destination_id);

      if (originIndex !== -1 && destIndex !== -1 && originIndex < destIndex) {
        validLineIds.push(line.id);
      }
    }

    if (validLineIds.length === 0) {
      return {
        date,
        origin: { id: originStation.id, name: originStation.name, code: originStation.code },
        destination: { id: destinationStation.id, name: destinationStation.name, code: destinationStation.code },
        total_schedules: 0,
        schedules: [],
      };
    }

    // Parse date window for query (from 00:00:00 to 23:59:59 UTC/Local)
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    const schedules = await prisma.schedule.findMany({
      where: {
        lineId: { in: validLineIds },
        departureTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { departureTime: 'asc' },
      include: {
        line: {
          include: {
            startStation: true,
            endStation: true,
          },
        },
        train: {
          include: {
            coaches: {
              include: { coach: true },
            },
          },
        },
      },
    });

    const formattedSchedules = await Promise.all(
      schedules.map(async (s) => {
        const coaches = s.train.coaches.map((tc) => tc.coach);
        const totalSeats = coaches.reduce((sum, c) => sum + c.seatCount, 0);

        // Count occupied seats (active holds + confirmed bookings)
        const now = new Date();
        const [activeHoldCount, confirmedBookingCount] = await Promise.all([
          prisma.seatHold.count({
            where: {
              scheduleId: s.id,
              status: 'ACTIVE',
              expiresAt: { gt: now },
            },
          }),
          prisma.booking.count({
            where: {
              scheduleId: s.id,
              status: 'CONFIRMED',
            },
          }),
        ]);

        const occupiedSeats = activeHoldCount + confirmedBookingCount;
        const availableSeats = Math.max(0, totalSeats - occupiedSeats);

        const departure = new Date(s.departureTime);
        const arrival = new Date(s.arrivalTime);
        const durationMinutes = Math.round(
          (arrival.getTime() - departure.getTime()) / (1000 * 60),
        );

        return {
          schedule_id: s.id,
          train: {
            id: s.train.id,
            name: s.train.name,
            train_number: s.train.trainNumber,
          },
          line: {
            id: s.line.id,
            name: s.line.name,
          },
          departure_time: departure.toISOString(),
          arrival_time: arrival.toISOString(),
          duration_minutes: durationMinutes,
          total_seat_capacity: totalSeats,
          available_seats_count: availableSeats,
        };
      }),
    );

    return {
      date,
      origin: { id: originStation.id, name: originStation.name, code: originStation.code },
      destination: { id: destinationStation.id, name: destinationStation.name, code: destinationStation.code },
      total_schedules: formattedSchedules.length,
      schedules: formattedSchedules,
    };
  }

  /**
   * View available seats for a specific leg of the journey
   */
  async getSeatAvailability(scheduleId: string, query: QuerySeatsDto) {
    const { origin_id, destination_id } = query;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        line: {
          include: {
            startStation: true,
            endStation: true,
          },
        },
        train: {
          include: {
            coaches: {
              orderBy: { position: 'asc' },
              include: { coach: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule session with ID "${scheduleId}" not found`);
    }

    const now = new Date();

    // Fetch active seat holds and confirmed bookings for this schedule
    const [activeHolds, confirmedBookings] = await Promise.all([
      prisma.seatHold.findMany({
        where: {
          scheduleId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        select: { coachId: true, seatNumber: true },
      }),
      prisma.booking.findMany({
        where: {
          scheduleId,
          status: 'CONFIRMED',
        },
        select: { coachId: true, seatNumber: true },
      }),
    ]);

    // Build occupied seat set "coachId-seatNumber"
    const occupiedSet = new Set<string>();
    activeHolds.forEach((h) => occupiedSet.add(`${h.coachId}-${h.seatNumber}`));
    confirmedBookings.forEach((b) => occupiedSet.add(`${b.coachId}-${b.seatNumber}`));

    const coachesData = schedule.train.coaches.map((tc) => {
      const coach = tc.coach;
      const seats: Array<{
        seat_number: number;
        is_available: boolean;
        is_reserved: boolean;
      }> = [];

      for (let seatNo = 1; seatNo <= coach.seatCount; seatNo++) {
        const isOccupied = occupiedSet.has(`${coach.id}-${seatNo}`);
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

    return {
      schedule_id: schedule.id,
      train: {
        id: schedule.train.id,
        name: schedule.train.name,
        train_number: schedule.train.trainNumber,
      },
      departure_time: schedule.departureTime,
      arrival_time: schedule.arrivalTime,
      coaches: coachesData,
    };
  }
}
