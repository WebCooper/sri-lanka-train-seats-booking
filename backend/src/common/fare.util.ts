import { COACH_CLASSES, type CoachClass } from './coach.util';

export const FARE_SETTINGS_ID = 'singleton';

export const DEFAULT_FARE_SETTINGS = {
  flatBookingFee: 50,
  ratePerKm: 10,
  offPeakMultiplier: 1,
};

export const DEFAULT_COACH_CLASS_MULTIPLIERS: Record<CoachClass, number> = {
  FIRST: 2,
  SECOND: 1.5,
  THIRD: 1,
  OBSERVATION: 2.5,
};

export interface PeakHourRuleLike {
  startTime: string;
  endTime: string;
  multiplier: number;
  daysOfWeek: number[];
}

export interface FareQuoteBreakdown {
  flat_booking_fee: number;
  distance_km: number;
  distance_charge: number;
  base_amount: number;
  coach_class: string;
  coach_class_multiplier: number;
  time_multiplier: number;
  time_band: 'peak' | 'off_peak';
  fare_amount: number;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isDepartureInPeakWindow(
  departure: Date,
  rule: PeakHourRuleLike,
): boolean {
  const day = departure.getDay();
  if (!rule.daysOfWeek.includes(day)) {
    return false;
  }

  const departureMinutes =
    departure.getHours() * 60 + departure.getMinutes();
  const startMinutes = parseTimeToMinutes(rule.startTime);
  const endMinutes = parseTimeToMinutes(rule.endTime);

  return departureMinutes >= startMinutes && departureMinutes < endMinutes;
}

export function resolveTimeMultiplier(
  departure: Date,
  offPeakMultiplier: number,
  peakRules: PeakHourRuleLike[],
): { multiplier: number; band: 'peak' | 'off_peak' } {
  const matchingRules = peakRules.filter((rule) =>
    isDepartureInPeakWindow(departure, rule),
  );

  if (matchingRules.length === 0) {
    return { multiplier: offPeakMultiplier, band: 'off_peak' };
  }

  return {
    multiplier: Math.max(...matchingRules.map((rule) => rule.multiplier)),
    band: 'peak',
  };
}

export function calculateFareAmount(
  distanceKm: number,
  coachClass: string,
  coachClassMultiplier: number,
  flatBookingFee: number,
  ratePerKm: number,
  timeMultiplier: number,
): number {
  const distanceCharge = distanceKm * ratePerKm;
  const baseAmount = flatBookingFee + distanceCharge;
  const rawFare = baseAmount * coachClassMultiplier * timeMultiplier;
  return Math.round(rawFare * 100) / 100;
}

export function buildFareQuoteBreakdown(
  distanceKm: number,
  coachClass: string,
  coachClassMultiplier: number,
  flatBookingFee: number,
  ratePerKm: number,
  timeMultiplier: number,
  timeBand: 'peak' | 'off_peak',
): FareQuoteBreakdown {
  const distanceCharge = distanceKm * ratePerKm;
  const baseAmount = flatBookingFee + distanceCharge;
  const fareAmount = calculateFareAmount(
    distanceKm,
    coachClass,
    coachClassMultiplier,
    flatBookingFee,
    ratePerKm,
    timeMultiplier,
  );

  return {
    flat_booking_fee: flatBookingFee,
    distance_km: distanceKm,
    distance_charge: Math.round(distanceCharge * 100) / 100,
    base_amount: Math.round(baseAmount * 100) / 100,
    coach_class: coachClass,
    coach_class_multiplier: coachClassMultiplier,
    time_multiplier: timeMultiplier,
    time_band: timeBand,
    fare_amount: fareAmount,
  };
}

export function defaultCoachClassMultipliers(): Array<{
  coachClass: CoachClass;
  multiplier: number;
}> {
  return COACH_CLASSES.map((coachClass) => ({
    coachClass,
    multiplier: DEFAULT_COACH_CLASS_MULTIPLIERS[coachClass],
  }));
}
