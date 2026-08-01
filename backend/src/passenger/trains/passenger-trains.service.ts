import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { QueryPassengerTrainDto } from '../dto/query-passenger-train.dto';

@Injectable()
export class PassengerTrainService {
  async findAll(query: QueryPassengerTrainDto) {
    const { line_id, search } = query;
    const searchTerm = search?.trim();

    const trains = await prisma.train.findMany({
      where: {
        ...(line_id ? { lineId: line_id } : {}),
        ...(searchTerm
          ? {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { trainNumber: { contains: searchTerm, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        line: {
          select: {
            id: true,
            name: true,
          },
        },
        coaches: {
          orderBy: { position: 'asc' },
          include: { coach: true },
        },
      },
    });

    return trains.map((train) => this.formatTrain(train));
  }

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
          include: { coach: true },
        },
      },
    });

    if (!train) {
      throw new NotFoundException(`Train with ID "${id}" not found`);
    }

    return this.formatTrain(train);
  }

  private formatTrain(train: {
    id: string;
    name: string;
    trainNumber: string;
    line: { id: string; name: string } | null;
    coaches: Array<{
      position: number;
      coach: {
        id: string;
        identifier: string;
        seatCount: number;
        isReserved: boolean;
      };
    }>;
  }) {
    const coaches = train.coaches.map((entry) => ({
      id: entry.coach.id,
      identifier: entry.coach.identifier,
      seat_count: entry.coach.seatCount,
      is_reserved: entry.coach.isReserved,
      position: entry.position,
    }));

    const reservedCoaches = coaches.filter((coach) => coach.is_reserved);
    const totalReservedSeats = reservedCoaches.reduce(
      (sum, coach) => sum + coach.seat_count,
      0,
    );

    return {
      id: train.id,
      name: train.name,
      train_number: train.trainNumber,
      line: train.line,
      coach_count: coaches.length,
      reserved_coach_count: reservedCoaches.length,
      total_reserved_seat_count: totalReservedSeats,
      coaches,
    };
  }
}
