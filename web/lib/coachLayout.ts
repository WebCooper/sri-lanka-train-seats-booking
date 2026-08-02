export const COACH_CLASS_LABELS: Record<string, string> = {
  FIRST: '1st Class',
  SECOND: '2nd Class',
  THIRD: '3rd Class',
  OBSERVATION: 'Observation',
};

export interface SeatMapLayoutMetrics {
  seatSize: number;
  seatGap: number;
  rowGap: number;
  aisleWidth: number;
  coachPadding: number;
}

const BASE_SEAT_MAP_LAYOUT: SeatMapLayoutMetrics = {
  seatSize: 44,
  seatGap: 6,
  rowGap: 8,
  aisleWidth: 24,
  coachPadding: 16,
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

export function estimateRowWidth(
  seatConfiguration: string,
  layout: SeatMapLayoutMetrics,
): number {
  const groups = parseSeatConfiguration(seatConfiguration);
  const { seatSize, seatGap, aisleWidth } = layout;

  return (
    groups.reduce(
      (sum, groupSize) => sum + groupSize * seatSize + Math.max(0, groupSize - 1) * seatGap,
      0,
    ) + Math.max(0, groups.length - 1) * aisleWidth
  );
}

export function estimateCoachStackHeight(
  rowCount: number,
  layout: SeatMapLayoutMetrics,
): number {
  const { seatSize, rowGap } = layout;
  return rowCount * seatSize + Math.max(0, rowCount - 1) * rowGap;
}

/** Unrotated coach frame tuned to the 2+2 layout the UI was designed around. */
export const COACH_FRAME = {
  referenceConfiguration: '2+2',
  bodyWidth:
    estimateRowWidth('2+2', BASE_SEAT_MAP_LAYOUT) + BASE_SEAT_MAP_LAYOUT.coachPadding,
  bodyHeight: 520,
  viewportWidth: 520,
  viewportHeight: 300,
} as const;

/** Portrait coach frame for mobile — natural row stack, no CSS rotation. */
export const COACH_PORTRAIT_FRAME = {
  bodyWidth: COACH_FRAME.bodyWidth,
  maxBodyHeight: 720,
} as const;

export type CoachMapOrientation = 'portrait' | 'landscape';

function scaleLayout(
  layout: SeatMapLayoutMetrics,
  scale: number,
): SeatMapLayoutMetrics {
  return {
    seatSize: layout.seatSize * scale,
    seatGap: layout.seatGap * scale,
    rowGap: layout.rowGap * scale,
    aisleWidth: layout.aisleWidth * scale,
    coachPadding: layout.coachPadding * scale,
  };
}

/**
 * Keep the coach frame fixed (2+2 reference) and shrink seat metrics when a row
 * is wider (2+3, 3+2) or when there are more rows than fit comfortably.
 */
export function resolveCoachSeatLayout(
  rowCount: number,
  seatConfiguration: string,
  orientation: CoachMapOrientation = 'landscape',
): SeatMapLayoutMetrics {
  let layout = { ...BASE_SEAT_MAP_LAYOUT };

  const bodyWidth =
    orientation === 'portrait' ? COACH_PORTRAIT_FRAME.bodyWidth : COACH_FRAME.bodyWidth;
  const bodyHeight =
    orientation === 'portrait' ? COACH_PORTRAIT_FRAME.maxBodyHeight : COACH_FRAME.bodyHeight;

  const rowWidth = estimateRowWidth(seatConfiguration, layout);
  if (rowWidth > bodyWidth - layout.coachPadding) {
    const availableWidth = bodyWidth - layout.coachPadding;
    layout = scaleLayout(layout, availableWidth / rowWidth);
  }

  const stackHeight = estimateCoachStackHeight(rowCount, layout);
  const availableHeight = bodyHeight - layout.coachPadding;
  if (stackHeight > availableHeight) {
    layout = scaleLayout(layout, availableHeight / stackHeight);
  }

  return layout;
}

export { BASE_SEAT_MAP_LAYOUT as SEAT_MAP_LAYOUT };
