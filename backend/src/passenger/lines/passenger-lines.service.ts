import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../../lib/prisma';

@Injectable()
export class PassengerLineService {
  async findAll() {
    const lines = await prisma.line.findMany({
      orderBy: { name: 'asc' },
      include: {
        startStation: true,
        endStation: true,
        stations: {
          orderBy: { position: 'asc' },
          include: { station: true },
        },
      },
    });

    return lines.map((line) => this.formatLine(line));
  }

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

    return this.formatLine(line);
  }

  private formatLine(line: {
    id: string;
    name: string;
    startStation: { id: string; name: string; code: string; location: string | null };
    endStation: { id: string; name: string; code: string; location: string | null };
    stations: Array<{
      position: number;
      distanceFromStart: number;
      station: { id: string; name: string; code: string; location: string | null };
    }>;
  }) {
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
      stations: line.stations.map((entry) => ({
        id: entry.station.id,
        name: entry.station.name,
        code: entry.station.code,
        location: entry.station.location,
        position: entry.position,
        distance_from_start: entry.distanceFromStart,
      })),
    };
  }
}
