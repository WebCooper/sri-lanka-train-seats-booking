import { Injectable } from '@nestjs/common';
import { prisma } from '../../lib/prisma';
import {
  buildStationSequence,
  getSegmentPositions,
  segmentsOverlap,
  type LineWithStations,
} from './line-segment.util';

export const ALLOCATION_STATUS = {
  ACTIVE: 'ACTIVE',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export interface BlockingAllocation {
  id: string;
  coachId: string;
  seatNumber: number;
  originStationId: string;
  destinationStationId: string;
  originPosition: number;
  destinationPosition: number;
  status: string;
}

@Injectable()
export class SegmentAllocationService {
  async expireStaleHolds(scheduleId?: string) {
    const now = new Date();

    await prisma.seatSegmentAllocation.updateMany({
      where: {
        status: ALLOCATION_STATUS.ACTIVE,
        expiresAt: { lte: now },
        ...(scheduleId ? { scheduleId } : {}),
      },
      data: {
        status: ALLOCATION_STATUS.EXPIRED,
      },
    });
  }

  async fetchBlockingAllocations(
    scheduleId: string,
    excludeAllocationId?: string,
  ): Promise<BlockingAllocation[]> {
    await this.expireStaleHolds(scheduleId);

    const now = new Date();

    return prisma.seatSegmentAllocation.findMany({
      where: {
        scheduleId,
        ...(excludeAllocationId ? { id: { not: excludeAllocationId } } : {}),
        OR: [
          { status: ALLOCATION_STATUS.CONFIRMED },
          {
            status: ALLOCATION_STATUS.ACTIVE,
            expiresAt: { gt: now },
          },
        ],
      },
      select: {
        id: true,
        coachId: true,
        seatNumber: true,
        originStationId: true,
        destinationStationId: true,
        originPosition: true,
        destinationPosition: true,
        status: true,
      },
    });
  }

  resolveSegmentPositions(
    line: LineWithStations,
    originStationId: string,
    destinationStationId: string,
  ) {
    const sequence = buildStationSequence(line);
    return getSegmentPositions(sequence, originStationId, destinationStationId);
  }

  hasPositionOverlap(
    queryOriginPos: number,
    queryDestPos: number,
    allocation: Pick<BlockingAllocation, 'originPosition' | 'destinationPosition'>,
  ): boolean {
    return segmentsOverlap(
      queryOriginPos,
      queryDestPos,
      allocation.originPosition,
      allocation.destinationPosition,
    );
  }

  hasSeatSegmentConflict(
    coachId: string,
    seatNumber: number,
    queryOriginPos: number,
    queryDestPos: number,
    allocations: BlockingAllocation[],
  ): boolean {
    return allocations.some(
      (allocation) =>
        allocation.coachId === coachId &&
        allocation.seatNumber === seatNumber &&
        this.hasPositionOverlap(queryOriginPos, queryDestPos, allocation),
    );
  }

  isExclusionConstraintViolation(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();
    return (
      message.includes('exclusion constraint') ||
      message.includes('seat_segment_allocation_no_overlap') ||
      message.includes('23p01')
    );
  }
}
