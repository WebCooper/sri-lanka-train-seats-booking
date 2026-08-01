/**
 * Configurable seed constants for the Colombo Fort–Badulla line.
 * Coaches, seats-per-coach, and stations are data-driven — not hardcoded in booking logic.
 */

export type CoachTypeConfig = 'RESERVED' | 'UNRESERVED';

export interface StationSeed {
  name: string;
  code: string;
  sequence: number;
  distanceFromStartKm: number;
}

export interface CoachSeed {
  code: string;
  type: CoachTypeConfig;
  sortOrder: number;
  seatCount: number;
  seatsPerRow: number;
}

export const LINE_SEED = {
  name: 'Colombo Fort – Badulla Main Line',
  code: 'CF-BA',
} as const;

/** Ordered stations along the scenic upcountry line (configurable subset). */
export const STATIONS_SEED: StationSeed[] = [
  { name: 'Colombo Fort', code: 'CNF', sequence: 0, distanceFromStartKm: 0 },
  { name: 'Ragama', code: 'RGM', sequence: 1, distanceFromStartKm: 19 },
  { name: 'Polgahawela', code: 'PLG', sequence: 2, distanceFromStartKm: 74 },
  { name: 'Peradeniya Junction', code: 'PDN', sequence: 3, distanceFromStartKm: 115 },
  { name: 'Kandy', code: 'KDY', sequence: 4, distanceFromStartKm: 120 },
  { name: 'Hatton', code: 'HTN', sequence: 5, distanceFromStartKm: 173 },
  { name: 'Nanu Oya', code: 'NOA', sequence: 6, distanceFromStartKm: 206 },
  { name: 'Ella', code: 'ELL', sequence: 7, distanceFromStartKm: 271 },
  { name: 'Badulla', code: 'BAD', sequence: 8, distanceFromStartKm: 292 },
];

/** 3 reserved + 5 unreserved coaches (assignment background); counts are configurable. */
export const COACHES_SEED: CoachSeed[] = [
  { code: 'R1', type: 'RESERVED', sortOrder: 1, seatCount: 40, seatsPerRow: 4 },
  { code: 'R2', type: 'RESERVED', sortOrder: 2, seatCount: 40, seatsPerRow: 4 },
  { code: 'R3', type: 'RESERVED', sortOrder: 3, seatCount: 40, seatsPerRow: 4 },
  { code: 'U1', type: 'UNRESERVED', sortOrder: 4, seatCount: 0, seatsPerRow: 0 },
  { code: 'U2', type: 'UNRESERVED', sortOrder: 5, seatCount: 0, seatsPerRow: 0 },
  { code: 'U3', type: 'UNRESERVED', sortOrder: 6, seatCount: 0, seatsPerRow: 0 },
  { code: 'U4', type: 'UNRESERVED', sortOrder: 7, seatCount: 0, seatsPerRow: 0 },
  { code: 'U5', type: 'UNRESERVED', sortOrder: 8, seatCount: 0, seatsPerRow: 0 },
];

export const DEFAULT_TRIP = {
  /** ISO date (YYYY-MM-DD) used as the demo departure day */
  departureDate: '2026-08-15',
  departureTime: '05:55',
  name: 'Udarata Menike (Demo)',
} as const;

export const DEFAULT_ADMIN = {
  email: 'admin@trainbooking.lk',
  password: 'Admin123!',
  name: 'Department Admin',
} as const;

export const DEFAULT_USER = {
  email: 'passenger@example.com',
  password: 'Passenger123!',
  name: 'Demo Passenger',
} as const;
