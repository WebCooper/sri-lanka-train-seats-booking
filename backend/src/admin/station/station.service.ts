import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationDto } from './dto/query-station.dto';

@Injectable()
export class StationService {
  /**
   * List all available stations with pagination and search filter
   */
  async findAll(query: QueryStationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [stations, total] = await Promise.all([
      prisma.station.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.station.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: stations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add a new station
   */
  async createStation(dto: CreateStationDto) {
    const existingCode = await prisma.station.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existingCode) {
      throw new ConflictException(`Station code "${dto.code.toUpperCase()}" is already registered`);
    }

    return prisma.station.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        location: dto.location ?? null,
      },
    });
  }

  /**
   * Retrieve station details by ID
   */
  async findOne(id: string) {
    const station = await prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException(`Station with ID "${id}" not found`);
    }

    return station;
  }

  /**
   * Update station details
   */
  async updateStation(id: string, dto: UpdateStationDto) {
    const existingStation = await this.findOne(id);

    if (dto.code && dto.code.toUpperCase() !== existingStation.code) {
      const codeTaken = await prisma.station.findUnique({
        where: { code: dto.code.toUpperCase() },
      });
      if (codeTaken) {
        throw new ConflictException(`Station code "${dto.code.toUpperCase()}" is already registered`);
      }
    }

    return prisma.station.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.code ? { code: dto.code.toUpperCase() } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
      },
    });
  }

  /**
   * Remove a station from the system
   */
  async removeStation(id: string) {
    await this.findOne(id);

    // Check if station is referenced in lines
    const lineUsageCount = await prisma.line.count({
      where: {
        OR: [
          { startStationId: id },
          { endStationId: id },
          { stations: { some: { stationId: id } } },
        ],
      },
    });

    if (lineUsageCount > 0) {
      throw new BadRequestException(
        'Cannot delete station because it is assigned to one or more train lines',
      );
    }

    await prisma.station.delete({
      where: { id },
    });

    return {
      message: 'Station deleted successfully',
      id,
    };
  }
}
