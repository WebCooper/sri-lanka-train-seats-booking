import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { QueryTrainDto } from './dto/query-train.dto';

@Injectable()
export class TrainService {
  /**
   * List all trains with pagination, line filter, and search
   */
  async findAll(query: QueryTrainDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { line_id, search } = query;

    const whereCondition = {
      ...(line_id ? { lineId: line_id } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { trainNumber: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [trains, total] = await Promise.all([
      prisma.train.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          line: {
            select: {
              id: true,
              name: true,
            },
          },
          coaches: {
            orderBy: { position: 'asc' },
            include: {
              coach: true,
            },
          },
        },
      }),
      prisma.train.count({
        where: whereCondition,
      }),
    ]);

    const data = trains.map((t) => this.formatTrainResponse(t));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add a new train with line assignment and attached coaches
   */
  async createTrain(dto: CreateTrainDto) {
    const existingNumber = await prisma.train.findUnique({
      where: { trainNumber: dto.train_number },
    });

    if (existingNumber) {
      throw new ConflictException(`Train number "${dto.train_number}" is already registered`);
    }

    if (dto.line_id) {
      const lineExists = await prisma.line.findUnique({
        where: { id: dto.line_id },
      });
      if (!lineExists) {
        throw new NotFoundException(`Line with ID "${dto.line_id}" not found`);
      }
    }

    if (dto.coach_ids && dto.coach_ids.length > 0) {
      const existingCoaches = await prisma.coach.findMany({
        where: { id: { in: dto.coach_ids } },
      });

      if (existingCoaches.length !== dto.coach_ids.length) {
        throw new NotFoundException('One or more specified coach IDs were not found');
      }
    }

    const createdTrain = await prisma.$transaction(async (tx) => {
      const train = await tx.train.create({
        data: {
          name: dto.name,
          trainNumber: dto.train_number,
          lineId: dto.line_id ?? null,
        },
      });

      if (dto.coach_ids && dto.coach_ids.length > 0) {
        await tx.trainCoach.createMany({
          data: dto.coach_ids.map((coachId, index) => ({
            trainId: train.id,
            coachId,
            position: index,
          })),
        });
      }

      return tx.train.findUniqueOrThrow({
        where: { id: train.id },
        include: {
          line: { select: { id: true, name: true } },
          coaches: {
            orderBy: { position: 'asc' },
            include: { coach: true },
          },
        },
      });
    });

    return this.formatTrainResponse(createdTrain);
  }

  /**
   * Retrieve train details with assigned line and coaches
   */
  async findOne(id: string) {
    const train = await prisma.train.findUnique({
      where: { id },
      include: {
        line: {
          select: {
            id: true,
            name: true,
          },
        },
        coaches: {
          orderBy: { position: 'asc' },
          include: {
            coach: true,
          },
        },
      },
    });

    if (!train) {
      throw new NotFoundException(`Train with ID "${id}" not found`);
    }

    return this.formatTrainResponse(train);
  }

  /**
   * Update train configuration (details, line assignment, or coaches)
   */
  async updateTrain(id: string, dto: UpdateTrainDto) {
    const existingTrain = await prisma.train.findUnique({ where: { id } });
    if (!existingTrain) {
      throw new NotFoundException(`Train with ID "${id}" not found`);
    }

    if (dto.train_number && dto.train_number !== existingTrain.trainNumber) {
      const numberTaken = await prisma.train.findUnique({
        where: { trainNumber: dto.train_number },
      });
      if (numberTaken) {
        throw new ConflictException(`Train number "${dto.train_number}" is already registered`);
      }
    }

    if (dto.line_id) {
      const lineExists = await prisma.line.findUnique({ where: { id: dto.line_id } });
      if (!lineExists) {
        throw new NotFoundException(`Line with ID "${dto.line_id}" not found`);
      }
    }

    if (dto.coach_ids && dto.coach_ids.length > 0) {
      const existingCoaches = await prisma.coach.findMany({
        where: { id: { in: dto.coach_ids } },
      });
      if (existingCoaches.length !== dto.coach_ids.length) {
        throw new NotFoundException('One or more specified coach IDs were not found');
      }
    }

    const updatedTrain = await prisma.$transaction(async (tx) => {
      await tx.train.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.train_number ? { trainNumber: dto.train_number } : {}),
          ...(dto.line_id !== undefined ? { lineId: dto.line_id } : {}),
        },
      });

      if (dto.coach_ids !== undefined) {
        await tx.trainCoach.deleteMany({ where: { trainId: id } });

        if (dto.coach_ids.length > 0) {
          await tx.trainCoach.createMany({
            data: dto.coach_ids.map((coachId, index) => ({
              trainId: id,
              coachId,
              position: index,
            })),
          });
        }
      }

      return tx.train.findUniqueOrThrow({
        where: { id },
        include: {
          line: { select: { id: true, name: true } },
          coaches: {
            orderBy: { position: 'asc' },
            include: { coach: true },
          },
        },
      });
    });

    return this.formatTrainResponse(updatedTrain);
  }

  /**
   * Remove a train from the system
   */
  async removeTrain(id: string) {
    await this.findOne(id);

    await prisma.train.delete({
      where: { id },
    });

    return {
      message: 'Train deleted successfully',
      id,
    };
  }

  /**
   * Format Prisma Train result into clean JSON payload
   */
  private formatTrainResponse(train: any) {
    const coaches = train.coaches
      ? train.coaches.map((tc: any) => ({
          id: tc.coach.id,
          identifier: tc.coach.identifier,
          seat_count: tc.coach.seatCount,
          is_reserved: tc.coach.isReserved,
          position: tc.position,
        }))
      : [];

    const totalSeats = coaches.reduce(
      (sum: number, c: any) => sum + (c.seat_count || 0),
      0,
    );

    return {
      id: train.id,
      name: train.name,
      train_number: train.trainNumber,
      line: train.line
        ? {
            id: train.line.id,
            name: train.line.name,
          }
        : null,
      coach_count: coaches.length,
      total_seat_count: totalSeats,
      coaches,
      createdAt: train.createdAt,
      updatedAt: train.updatedAt,
    };
  }
}
