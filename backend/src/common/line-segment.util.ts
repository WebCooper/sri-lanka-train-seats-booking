export interface StationSequenceEntry {
  id: string;
  position: number;
}

export interface LineWithStations {
  id: string;
  startStationId: string;
  endStationId: string;
  stations: { stationId: string; position: number }[];
}

export function buildStationSequence(line: LineWithStations): StationSequenceEntry[] {
  return [
    { id: line.startStationId, position: -1 },
    ...line.stations.map((s) => ({ id: s.stationId, position: s.position })),
    { id: line.endStationId, position: 999999 },
  ];
}

export function getSegmentPositions(
  sequence: StationSequenceEntry[],
  originId: string,
  destId: string,
): { originPos: number; destPos: number } | null {
  const originEntry = sequence.find((s) => s.id === originId);
  const destEntry = sequence.find((s) => s.id === destId);

  if (!originEntry || !destEntry || originEntry.position >= destEntry.position) {
    return null;
  }

  return { originPos: originEntry.position, destPos: destEntry.position };
}

export function segmentsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isOriginBeforeDestination(
  line: LineWithStations,
  originId: string,
  destId: string,
): boolean {
  const sequence = buildStationSequence(line);
  return getSegmentPositions(sequence, originId, destId) !== null;
}

export function findValidLineIds(
  lines: LineWithStations[],
  originId: string,
  destId: string,
): string[] {
  return lines
    .filter((line) => isOriginBeforeDestination(line, originId, destId))
    .map((line) => line.id);
}

export interface SegmentOccupancy {
  coachId: string;
  seatNumber: number;
  originStationId: string;
  destinationStationId: string;
}

export function isSeatOccupiedForSegment(
  sequence: StationSequenceEntry[],
  queryOriginPos: number,
  queryDestPos: number,
  occupancy: SegmentOccupancy,
): boolean {
  const occSegment = getSegmentPositions(
    sequence,
    occupancy.originStationId,
    occupancy.destinationStationId,
  );

  if (!occSegment) {
    return true;
  }

  return segmentsOverlap(
    queryOriginPos,
    queryDestPos,
    occSegment.originPos,
    occSegment.destPos,
  );
}
