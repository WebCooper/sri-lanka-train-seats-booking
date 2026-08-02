import {
  buildFareQuoteBreakdown,
  calculateFareAmount,
  isDepartureInPeakWindow,
  resolveTimeMultiplier,
} from './fare.util';

describe('fare.util', () => {
  it('calculates fare using configured formula', () => {
    const fare = calculateFareAmount(120, 'FIRST', 2, 50, 10, 1.25);
    expect(fare).toBe(3125);
  });

  it('detects peak windows using half-open intervals', () => {
    const departure = new Date('2026-08-15T09:30:00');
    const rule = {
      startTime: '07:00',
      endTime: '09:30',
      multiplier: 1.25,
      daysOfWeek: [6],
    };

    expect(isDepartureInPeakWindow(departure, rule)).toBe(false);
    expect(
      isDepartureInPeakWindow(new Date('2026-08-15T08:00:00'), rule),
    ).toBe(true);
  });

  it('falls back to off-peak multiplier when no peak rule matches', () => {
    const result = resolveTimeMultiplier(
      new Date('2026-08-15T12:00:00'),
      0.9,
      [
        {
          startTime: '07:00',
          endTime: '09:30',
          multiplier: 1.25,
          daysOfWeek: [6],
        },
      ],
    );

    expect(result).toEqual({ multiplier: 0.9, band: 'off_peak' });
  });

  it('builds a fare quote breakdown payload', () => {
    const breakdown = buildFareQuoteBreakdown(100, 'SECOND', 1.5, 50, 10, 1, 'off_peak');
    expect(breakdown.base_amount).toBe(1050);
    expect(breakdown.fare_amount).toBe(1575);
    expect(breakdown.time_band).toBe('off_peak');
  });
});
