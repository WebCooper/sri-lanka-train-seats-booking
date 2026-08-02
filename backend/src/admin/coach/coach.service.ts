import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { isSeatCountCompatible } from '../../common/coach.util';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { QueryCoachDto } from './dto/query-coach.dto';

@Injectable()
export class CoachService {
  /**
   * List all coaches with pagination and filters
   */
  async findAll(query: QueryCoachDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const isReserved = query.is_reserved;
    const coachClass = query.coach_class;

    const whereCondition = {
      ...(isReserved !== undefined ? { isReserved } : {}),
      ...(coachClass ? { coachClass } : {}),
      ...(search
        ? {
            identifier: { contains: search, mode: 'insensitive' as const },
          }
        : {}),
    };

    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { identifier: 'asc' },
        include: {
          trainCoaches: {
            include: {
              train: {
                select: { id: true, name: true, trainNumber: true },
              },
            },
          },
        },
      }),
      prisma.coach.count({
        where: whereCondition,
      }),
    ]);

    const data = coaches.map((c) => this.formatCoachResponse(c));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add a new coach to the system
   */
  async createCoach(dto: CreateCoachDto) {
    const identifierUpper = dto.identifier.toUpperCase().trim();

    this.assertSeatCountCompatible(dto.seat_count, dto.seat_configuration);

    const existingIdentifier = await prisma.coach.findUnique({
      where: { identifier: identifierUpper },
    });

    if (existingIdentifier) {
      throw new ConflictException(
        `Coach identifier "${identifierUpper}" is already registered`,
      );
    }

    const createdCoach = await prisma.coach.create({
      data: {
        identifier: identifierUpper,
        seatCount: dto.seat_count,
        isReserved: dto.is_reserved ?? false,
        coachClass: dto.coach_class,
        seatConfiguration: dto.seat_configuration,
      },
      include: {
        trainCoaches: {
          include: {
            train: { select: { id: true, name: true, trainNumber: true } },
          },
        },
      },
    });

    return this.formatCoachResponse(createdCoach);
  }

  /**
   * Retrieve coach details by ID
   */
  async findOne(id: string) {
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        trainCoaches: {
          include: {
            train: {
              select: { id: true, name: true, trainNumber: true },
            },
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID "${id}" not found`);
    }

    return this.formatCoachResponse(coach);
  }

  /**
   * Update coach configuration
   */
  async updateCoach(id: string, dto: UpdateCoachDto) {
    const existingCoach = await this.findOne(id);

    const seatCount = dto.seat_count ?? existingCoach.seat_count;
    const seatConfiguration =
      dto.seat_configuration ?? existingCoach.seat_configuration;

    this.assertSeatCountCompatible(seatCount, seatConfiguration);

    if (
      dto.identifier &&
      dto.identifier.toUpperCase().trim() !== existingCoach.identifier
    ) {
      const identifierUpper = dto.identifier.toUpperCase().trim();
      const identifierTaken = await prisma.coach.findUnique({
        where: { identifier: identifierUpper },
      });
      if (identifierTaken) {
        throw new ConflictException(
          `Coach identifier "${identifierUpper}" is already registered`,
        );
      }
    }

    const updatedCoach = await prisma.coach.update({
      where: { id },
      data: {
        ...(dto.identifier
          ? { identifier: dto.identifier.toUpperCase().trim() }
          : {}),
        ...(dto.seat_count !== undefined ? { seatCount: dto.seat_count } : {}),
        ...(dto.is_reserved !== undefined
          ? { isReserved: dto.is_reserved }
          : {}),
        ...(dto.coach_class !== undefined
          ? { coachClass: dto.coach_class }
          : {}),
        ...(dto.seat_configuration !== undefined
          ? { seatConfiguration: dto.seat_configuration }
          : {}),
      },
      include: {
        trainCoaches: {
          include: {
            train: { select: { id: true, name: true, trainNumber: true } },
          },
        },
      },
    });

    return this.formatCoachResponse(updatedCoach);
  }

  /**
   * Remove a coach from the system
   */
  async removeCoach(id: string) {
    await this.findOne(id);

    const trainUsageCount = await prisma.trainCoach.count({
      where: { coachId: id },
    });

    if (trainUsageCount > 0) {
      throw new BadRequestException(
        'Cannot delete coach because it is attached to one or more trains',
      );
    }

    await prisma.coach.delete({
      where: { id },
    });

    return {
      message: 'Coach deleted successfully',
      id,
    };
  }

  /**
   * Format Prisma Coach result into clean JSON payload
   */
  private formatCoachResponse(coach: any) {
    const attachedTrains = coach.trainCoaches
      ? coach.trainCoaches.map((tc: any) => ({
          id: tc.train.id,
          name: tc.train.name,
          train_number: tc.train.trainNumber,
          position: tc.position,
        }))
      : [];

    return {
      id: coach.id,
      identifier: coach.identifier,
      seat_count: coach.seatCount,
      is_reserved: coach.isReserved,
      coach_class: coach.coachClass,
      seat_configuration: coach.seatConfiguration,
      attached_trains_count: attachedTrains.length,
      attached_trains: attachedTrains,
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt,
    };
  }

  private assertSeatCountCompatible(
    seatCount: number,
    seatConfiguration: string,
  ) {
    if (!isSeatCountCompatible(seatCount, seatConfiguration)) {
      throw new BadRequestException(
        `Seat count (${seatCount}) must be evenly divisible by seats per row (${seatConfiguration})`,
      );
    }
  }
}
