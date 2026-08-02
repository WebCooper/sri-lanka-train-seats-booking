export const COACH_CLASSES = ['FIRST', 'SECOND', 'THIRD', 'OBSERVATION'] as const;

export type CoachClass = (typeof COACH_CLASSES)[number];

export const SEAT_CONFIGURATION_PATTERN = /^\d+\+\d+$/;

export function seatsPerRow(seatConfiguration: string): number {
  return seatConfiguration
    .split('+')
    .reduce((sum, part) => sum + Number.parseInt(part, 10), 0);
}

export function isSeatCountCompatible(
  seatCount: number,
  seatConfiguration: string,
): boolean {
  const perRow = seatsPerRow(seatConfiguration);
  return seatCount > 0 && perRow > 0 && seatCount % perRow === 0;
}
