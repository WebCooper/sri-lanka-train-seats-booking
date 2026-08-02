export const COACH_CLASS_LABELS: Record<string, string> = {
  FIRST: '1st Class (AC Saloon)',
  SECOND: '2nd Class (Reserved)',
  THIRD: '3rd Class (Reserved)',
  OBSERVATION: 'Observation',
};

export function parseSeatConfiguration(seatConfiguration: string): number[] {
  return seatConfiguration.split('+').map((part) => Number.parseInt(part, 10));
}

export function seatsPerRow(seatConfiguration: string): number {
  return parseSeatConfiguration(seatConfiguration).reduce((sum, count) => sum + count, 0);
}

export function buildSeatRows(
  seatCount: number,
  seatConfiguration: string,
): number[][] {
  const perRow = seatsPerRow(seatConfiguration);
  if (perRow <= 0) {
    return [];
  }

  const rows: number[][] = [];
  for (let start = 1; start <= seatCount; start += perRow) {
    rows.push(
      Array.from({ length: perRow }, (_, index) => start + index).filter(
        (seatNumber) => seatNumber <= seatCount,
      ),
    );
  }

  return rows;
}

export function splitRowSeats(
  rowSeats: number[],
  seatConfiguration: string,
): number[][] {
  const groups = parseSeatConfiguration(seatConfiguration);
  const sections: number[][] = [];
  let offset = 0;

  for (const groupSize of groups) {
    sections.push(rowSeats.slice(offset, offset + groupSize));
    offset += groupSize;
  }

  return sections;
}
