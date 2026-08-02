/**
 * Recompute origin_position / destination_position for existing allocations
 * after switching from sentinel indexes (-1, 999999) to 0-based line indexes.
 *
 * Usage: npx ts-node scripts/backfill-segment-positions.ts
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import {
  buildStationSequence,
  getSegmentPositions,
} from '../src/common/line-segment.util';

async function main() {
  let updated = 0;
  let skipped = 0;

  const allocations = await prisma.seatSegmentAllocation.findMany({
    include: {
      schedule: {
        include: {
          line: {
            include: {
              stations: true,
            },
          },
        },
      },
    },
  });

  const updates: Array<{
    id: string;
    originPos: number;
    destPos: number;
    oldOrigin: number;
    oldDest: number;
  }> = [];

  for (const allocation of allocations) {
    const line = allocation.schedule.line;
    const sequence = buildStationSequence({
      id: line.id,
      startStationId: line.startStationId,
      endStationId: line.endStationId,
      stations: line.stations.map((station) => ({
        stationId: station.stationId,
        position: station.position,
      })),
    });

    const segment = getSegmentPositions(
      sequence,
      allocation.originStationId,
      allocation.destinationStationId,
    );

    if (!segment) {
      console.warn(
        `Skipping allocation ${allocation.id}: invalid segment on line ${line.name}`,
      );
      skipped += 1;
      continue;
    }

    if (
      allocation.originPosition === segment.originPos &&
      allocation.destinationPosition === segment.destPos
    ) {
      continue;
    }

    updates.push({
      id: allocation.id,
      originPos: segment.originPos,
      destPos: segment.destPos,
      oldOrigin: allocation.originPosition,
      oldDest: allocation.destinationPosition,
    });
  }

  if (updates.length === 0) {
    console.log('No allocations needed updating.');
    return;
  }

  const TEMP_OFFSET = 10_000_000;

  await prisma.$transaction(async (tx) => {
    for (const entry of updates) {
      await tx.seatSegmentAllocation.update({
        where: { id: entry.id },
        data: {
          originPosition: entry.oldOrigin + TEMP_OFFSET,
          destinationPosition: entry.oldDest + TEMP_OFFSET,
        },
      });
    }

    for (const entry of updates) {
      await tx.seatSegmentAllocation.update({
        where: { id: entry.id },
        data: {
          originPosition: entry.originPos,
          destinationPosition: entry.destPos,
        },
      });
    }
  });

  for (const entry of updates) {
    console.log(
      `Updated ${entry.id}: [${entry.oldOrigin}, ${entry.oldDest}) -> [${entry.originPos}, ${entry.destPos})`,
    );
    updated += 1;
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
