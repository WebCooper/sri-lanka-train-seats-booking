import type { Line, Station } from '../types/passenger';

export interface OrderedLineStation extends Station {
  position: number;
}

/** Ordered sequence matching backend line-segment.util (half-open segment indices). */
export function getLineStationSequence(line: Line): OrderedLineStation[] {
  const intermediates = [...line.stations].sort((a, b) => a.position - b.position);

  return [
    { ...line.start_station, position: -1 },
    ...intermediates.map((station) => ({
      id: station.id,
      name: station.name,
      code: station.code,
      location: station.location,
      position: station.position,
    })),
    { ...line.end_station, position: 999999 },
  ];
}

export function getOriginStationOptions(line: Line): OrderedLineStation[] {
  const sequence = getLineStationSequence(line);
  return sequence.slice(0, -1);
}

export function getDestinationStationOptions(
  line: Line,
  originId: string,
): OrderedLineStation[] {
  if (!originId) {
    return [];
  }

  const sequence = getLineStationSequence(line);
  const originIndex = sequence.findIndex((station) => station.id === originId);

  if (originIndex < 0) {
    return [];
  }

  return sequence.slice(originIndex + 1);
}

export function isDestinationAfterOrigin(
  line: Line,
  originId: string,
  destinationId: string,
): boolean {
  return getDestinationStationOptions(line, originId).some(
    (station) => station.id === destinationId,
  );
}
