import {
  buildStationSequence,
  findValidLineIds,
  getSegmentPositions,
  isSeatOccupiedForSegment,
  segmentsOverlap,
} from './line-segment.util';

describe('line-segment.util', () => {
  const sampleLine = {
    id: 'line-1',
    startStationId: 'colombo',
    endStationId: 'badulla',
    stations: [
      { stationId: 'kandy', position: 1 },
      { stationId: 'ella', position: 2 },
    ],
  };

  const sequence = buildStationSequence(sampleLine);

  it('builds an ordered station sequence including endpoints', () => {
    expect(sequence.map((entry) => entry.id)).toEqual([
      'colombo',
      'kandy',
      'ella',
      'badulla',
    ]);
  });

  it('detects overlapping segments', () => {
    expect(segmentsOverlap(0, 5, 3, 8)).toBe(true);
    expect(segmentsOverlap(0, 5, 5, 8)).toBe(false);
    expect(segmentsOverlap(3, 8, 0, 5)).toBe(true);
  });

  it('returns positions only when origin precedes destination', () => {
    expect(getSegmentPositions(sequence, 'colombo', 'kandy')).toEqual({
      originPos: 0,
      destPos: 1,
    });
    expect(getSegmentPositions(sequence, 'kandy', 'badulla')).toEqual({
      originPos: 1,
      destPos: 3,
    });
    expect(getSegmentPositions(sequence, 'kandy', 'colombo')).toBeNull();
  });

  it('finds valid line ids for a route segment', () => {
    expect(findValidLineIds([sampleLine], 'colombo', 'ella')).toEqual(['line-1']);
    expect(findValidLineIds([sampleLine], 'ella', 'colombo')).toEqual([]);
  });

  it('keeps seats available for adjacent non-overlapping journeys', () => {
    const kandyToBadulla = getSegmentPositions(sequence, 'kandy', 'badulla');

    const occupied = isSeatOccupiedForSegment(
      sequence,
      kandyToBadulla!.originPos,
      kandyToBadulla!.destPos,
      {
        coachId: 'coach-1',
        seatNumber: 12,
        originStationId: 'colombo',
        destinationStationId: 'kandy',
      },
    );

    expect(occupied).toBe(false);
  });

  it('marks nested overlapping journeys as occupied', () => {
    const kandyToBadulla = getSegmentPositions(sequence, 'kandy', 'badulla');

    const occupied = isSeatOccupiedForSegment(
      sequence,
      kandyToBadulla!.originPos,
      kandyToBadulla!.destPos,
      {
        coachId: 'coach-1',
        seatNumber: 12,
        originStationId: 'colombo',
        destinationStationId: 'ella',
      },
    );

    expect(occupied).toBe(true);
  });

  it('marks partial overlapping journeys as occupied', () => {
    const colomboToElla = getSegmentPositions(sequence, 'colombo', 'ella');

    const occupied = isSeatOccupiedForSegment(
      sequence,
      colomboToElla!.originPos,
      colomboToElla!.destPos,
      {
        coachId: 'coach-1',
        seatNumber: 12,
        originStationId: 'kandy',
        destinationStationId: 'badulla',
      },
    );

    expect(occupied).toBe(true);
  });
});
