import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { QueryLineDto } from './dto/query-line.dto';

@Injectable()
export class LineService {
  /**
   * List all train lines with pagination and search filter
   */
  async findAll(query: QueryLineDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const whereCondition = search
      ? {
          name: { contains: search, mode: 'insensitive' as const },
        }
      : {};

    const [lines, total] = await Promise.all([
      prisma.line.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          startStation: true,
          endStation: true,
          stations: {
            orderBy: { position: 'asc' },
            include: { station: true },
          },
        },
      }),
      prisma.line.count({
        where: whereCondition,
      }),
    ]);

    const data = lines.map((l) => this.formatLineResponse(l));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add a new train route/line with ordered intermediate stations
   */
  async createLine(dto: CreateLineDto) {
    if (dto.start_station_id === dto.end_station_id) {
      throw new BadRequestException('Start station and End station cannot be the same');
    }

    const [startStation, endStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: dto.start_station_id } }),
      prisma.station.findUnique({ where: { id: dto.end_station_id } }),
    ]);

    if (!startStation) {
      throw new NotFoundException(`Start station with ID "${dto.start_station_id}" not found`);
    }
    if (!endStation) {
      throw new NotFoundException(`End station with ID "${dto.end_station_id}" not found`);
    }

    if (dto.stations && dto.stations.length > 0) {
      const stationIds = dto.stations.map((s) => s.station_id);
      const existingStations = await prisma.station.findMany({
        where: { id: { in: stationIds } },
      });
      if (existingStations.length !== stationIds.length) {
        throw new NotFoundException('One or more intermediate station IDs were not found');
      }
    }

    const createdLine = await prisma.$transaction(async (tx) => {
      const line = await tx.line.create({
        data: {
          name: dto.name,
          startStationId: dto.start_station_id,
          endStationId: dto.end_station_id,
        },
      });

      if (dto.stations && dto.stations.length > 0) {
        await tx.lineStation.createMany({
          data: dto.stations.map((s, index) => ({
            lineId: line.id,
            stationId: s.station_id,
            position: index,
            distanceFromStart: s.distance_from_start ?? 0,
          })),
        });
      }

      return tx.line.findUniqueOrThrow({
        where: { id: line.id },
        include: {
          startStation: true,
          endStation: true,
          stations: {
            orderBy: { position: 'asc' },
            include: { station: true },
          },
        },
      });
    });

    return this.formatLineResponse(createdLine);
  }

  /**
   * Retrieve line details by ID including ordered stations
   */
  async findOne(id: string) {
    const line = await prisma.line.findUnique({
      where: { id },
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' },
          include: { station: true },
        },
      },
    });

    if (!line) {
      throw new NotFoundException(`Train line with ID "${id}" not found`);
    }

    return this.formatLineResponse(line);
  }

  /**
   * Update line route details or intermediate stations
   */
  async updateLine(id: string, dto: UpdateLineDto) {
    const existingLine = await this.findOne(id);

    const startId = dto.start_station_id ?? existingLine.start_station.id;
    const endId = dto.end_station_id ?? existingLine.end_station.id;

    if (startId === endId) {
      throw new BadRequestException('Start station and End station cannot be the same');
    }

    if (dto.start_station_id) {
      const startExists = await prisma.station.findUnique({ where: { id: dto.start_station_id } });
      if (!startExists) {
        throw new NotFoundException(`Start station with ID "${dto.start_station_id}" not found`);
      }
    }

    if (dto.end_station_id) {
      const endExists = await prisma.station.findUnique({ where: { id: dto.end_station_id } });
      if (!endExists) {
        throw new NotFoundException(`End station with ID "${dto.end_station_id}" not found`);
      }
    }

    if (dto.stations && dto.stations.length > 0) {
      const stationIds = dto.stations.map((s) => s.station_id);
      const existingStations = await prisma.station.findMany({
        where: { id: { in: stationIds } },
      });
      if (existingStations.length !== stationIds.length) {
        throw new NotFoundException('One or more intermediate station IDs were not found');
      }
    }

    const updatedLine = await prisma.$transaction(async (tx) => {
      await tx.line.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.start_station_id ? { startStationId: dto.start_station_id } : {}),
          ...(dto.end_station_id ? { endStationId: dto.end_station_id } : {}),
        },
      });

      if (dto.stations !== undefined) {
        await tx.lineStation.deleteMany({ where: { lineId: id } });

        if (dto.stations.length > 0) {
          await tx.lineStation.createMany({
            data: dto.stations.map((s, index) => ({
              lineId: id,
              stationId: s.station_id,
              position: index,
              distanceFromStart: s.distance_from_start ?? 0,
            })),
          });
        }
      }

      return tx.line.findUniqueOrThrow({
        where: { id },
        include: {
          startStation: true,
          endStation: true,
          stations: {
            orderBy: { position: 'asc' },
            include: { station: true },
          },
        },
      });
    });

    return this.formatLineResponse(updatedLine);
  }

  /**
   * Remove a line from the system
   */
  async removeLine(id: string) {
    await this.findOne(id);

    const [trainCount, scheduleCount] = await Promise.all([
      prisma.train.count({ where: { lineId: id } }),
      prisma.schedule.count({ where: { lineId: id } }),
    ]);

    if (trainCount > 0 || scheduleCount > 0) {
      throw new BadRequestException(
        'Cannot delete train line assigned to active trains or schedules',
      );
    }

    await prisma.line.delete({
      where: { id },
    });

    return {
      message: 'Line deleted successfully',
      id,
    };
  }

  /**
   * Format Prisma Line result into clean JSON payload
   */
  private formatLineResponse(line: any) {
    const stations = line.stations
      ? line.stations.map((ls: any) => ({
          id: ls.station.id,
          name: ls.station.name,
          code: ls.station.code,
          location: ls.station.location,
          position: ls.position,
          distance_from_start: ls.distanceFromStart,
        }))
      : [];

    return {
      id: line.id,
      name: line.name,
      start_station: {
        id: line.startStation.id,
        name: line.startStation.name,
        code: line.startStation.code,
        location: line.startStation.location,
      },
      end_station: {
        id: line.endStation.id,
        name: line.endStation.name,
        code: line.endStation.code,
        location: line.endStation.location,
      },
      total_intermediate_stations: stations.length,
      stations,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
    };
  }
}
