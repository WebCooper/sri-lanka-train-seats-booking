import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';

@Injectable()
export class ScheduleService {
  /**
   * List upcoming train sessions with pagination and filters
   */
  async findAll(query: QueryScheduleDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { line_id, train_id, date_from, date_to } = query;

    const whereCondition = {
      ...(line_id ? { lineId: line_id } : {}),
      ...(train_id ? { trainId: train_id } : {}),
      ...(date_from || date_to
        ? {
            departureTime: {
              ...(date_from ? { gte: new Date(date_from) } : {}),
              ...(date_to ? { lte: new Date(date_to) } : {}),
            },
          }
        : {}),
    };

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.schedule.count({
        where: whereCondition,
      }),
    ]);

    const data = schedules.map((s) => this.formatScheduleResponse(s));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Schedule a new train session
   */
  async createSchedule(dto: CreateScheduleDto) {
    const departureTime = new Date(dto.departure_time);
    const arrivalTime = new Date(dto.arrival_time);

    if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
      throw new BadRequestException('Invalid departure or arrival date format');
    }

    if (departureTime >= arrivalTime) {
      throw new BadRequestException('Arrival time must be strictly after departure time');
    }

    const [line, train] = await Promise.all([
      prisma.line.findUnique({ where: { id: dto.line_id } }),
      prisma.train.findUnique({ where: { id: dto.train_id } }),
    ]);

    if (!line) {
      throw new NotFoundException(`Train line with ID "${dto.line_id}" not found`);
    }

    if (!train) {
      throw new NotFoundException(`Train with ID "${dto.train_id}" not found`);
    }

    // Check for train scheduling conflicts (overlapping time window)
    const overlappingSchedule = await prisma.schedule.findFirst({
      where: {
        trainId: dto.train_id,
        departureTime: { lt: arrivalTime },
        arrivalTime: { gt: departureTime },
      },
    });

    if (overlappingSchedule) {
      throw new ConflictException(
        `Train "${train.name}" (${train.trainNumber}) is already scheduled on an overlapping trip during this time window`,
      );
    }

    const createdSchedule = await prisma.schedule.create({
      data: {
        lineId: dto.line_id,
        trainId: dto.train_id,
        departureTime,
        arrivalTime,
      },
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

    return this.formatScheduleResponse(createdSchedule);
  }

  /**
   * Retrieve session details by ID
   */
  async findOne(id: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        line: {
          include: {
            startStation: true,
            endStation: true,
            stations: {
              orderBy: { position: 'asc' },
              include: { station: true },
            },
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
      throw new NotFoundException(`Schedule session with ID "${id}" not found`);
    }

    return this.formatScheduleResponse(schedule);
  }

  /**
   * Modify session departure/arrival time, line, or assigned train
   */
  async updateSchedule(id: string, dto: UpdateScheduleDto) {
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule session with ID "${id}" not found`);
    }

    const lineId = dto.line_id ?? existingSchedule.lineId;
    const trainId = dto.train_id ?? existingSchedule.trainId;
    const departureTime = dto.departure_time
      ? new Date(dto.departure_time)
      : existingSchedule.departureTime;
    const arrivalTime = dto.arrival_time
      ? new Date(dto.arrival_time)
      : existingSchedule.arrivalTime;

    if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
      throw new BadRequestException('Invalid departure or arrival date format');
    }

    if (departureTime >= arrivalTime) {
      throw new BadRequestException('Arrival time must be strictly after departure time');
    }

    if (dto.line_id && dto.line_id !== existingSchedule.lineId) {
      const lineExists = await prisma.line.findUnique({ where: { id: dto.line_id } });
      if (!lineExists) {
        throw new NotFoundException(`Train line with ID "${dto.line_id}" not found`);
      }
    }

    if (dto.train_id && dto.train_id !== existingSchedule.trainId) {
      const trainExists = await prisma.train.findUnique({ where: { id: dto.train_id } });
      if (!trainExists) {
        throw new NotFoundException(`Train with ID "${dto.train_id}" not found`);
      }
    }

    // Check overlap excluding current schedule
    const overlappingSchedule = await prisma.schedule.findFirst({
      where: {
        id: { not: id },
        trainId,
        departureTime: { lt: arrivalTime },
        arrivalTime: { gt: departureTime },
      },
    });

    if (overlappingSchedule) {
      throw new ConflictException(
        'The assigned train is already scheduled on an overlapping trip during this time window',
      );
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        lineId,
        trainId,
        departureTime,
        arrivalTime,
      },
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

    return this.formatScheduleResponse(updatedSchedule);
  }

  /**
   * Cancel a scheduled train session
   */
  async removeSchedule(id: string) {
    await this.findOne(id);

    await prisma.schedule.delete({
      where: { id },
    });

    return {
      message: 'Schedule session canceled successfully',
      id,
    };
  }

  /**
   * Format Prisma Schedule result into clean JSON response
   */
  private formatScheduleResponse(schedule: any) {
    const departureTime = new Date(schedule.departureTime);
    const arrivalTime = new Date(schedule.arrivalTime);
    const durationMinutes = Math.round(
      (arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60),
    );

    const coaches = schedule.train?.coaches
      ? schedule.train.coaches.map((tc: any) => ({
          id: tc.coach.id,
          identifier: tc.coach.identifier,
          seat_count: tc.coach.seatCount,
          is_reserved: tc.coach.isReserved,
          coach_class: tc.coach.coachClass,
          seat_configuration: tc.coach.seatConfiguration,
          position: tc.position,
        }))
      : [];

    const totalSeats = coaches.reduce(
      (sum: number, c: any) => sum + (c.seat_count || 0),
      0,
    );

    return {
      id: schedule.id,
      line: schedule.line
        ? {
            id: schedule.line.id,
            name: schedule.line.name,
            start_station: schedule.line.startStation
              ? {
                  id: schedule.line.startStation.id,
                  name: schedule.line.startStation.name,
                  code: schedule.line.startStation.code,
                }
              : null,
            end_station: schedule.line.endStation
              ? {
                  id: schedule.line.endStation.id,
                  name: schedule.line.endStation.name,
                  code: schedule.line.endStation.code,
                }
              : null,
            ...(schedule.line.stations
              ? {
                  intermediate_stations: schedule.line.stations.map((ls: any) => ({
                    id: ls.station.id,
                    name: ls.station.name,
                    code: ls.station.code,
                    position: ls.position,
                    distance_from_start: ls.distanceFromStart,
                  })),
                }
              : {}),
          }
        : null,
      train: schedule.train
        ? {
            id: schedule.train.id,
            name: schedule.train.name,
            train_number: schedule.train.trainNumber,
            coach_count: coaches.length,
            total_seat_count: totalSeats,
            coaches,
          }
        : null,
      departure_time: departureTime.toISOString(),
      arrival_time: arrivalTime.toISOString(),
      duration_minutes: durationMinutes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
