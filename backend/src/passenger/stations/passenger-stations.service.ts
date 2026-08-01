import { Injectable } from '@nestjs/common';
import { prisma } from '../../../lib/prisma';

@Injectable()
export class PassengerStationService {
  /**
   * Fetch all stations to populate origin/destination dropdowns
   */
  async findAll() {
    return prisma.station.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        location: true,
      },
    });
  }
}
