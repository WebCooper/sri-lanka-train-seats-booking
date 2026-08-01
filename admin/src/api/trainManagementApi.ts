export interface Station {
  id: string;
  name: string;
  code: string;
  location?: string;
}

export interface LineStation {
  id?: string;
  stationId: string;
  stationName: string;
  stationCode: string;
  position: number;
  distanceFromStart: number;
}

export interface RailwayLine {
  id: string;
  name: string;
  startStationId: string;
  startStationName: string;
  startStationCode: string;
  endStationId: string;
  endStationName: string;
  endStationCode: string;
  stations: LineStation[];
  createdAt: string;
}

export interface CoachConfig {
  id: string;
  identifier: string;
  position: number;
  seatCount: number;
  isReserved: boolean;
}

export interface TrainConfig {
  id: string;
  name: string;
  trainNumber: string;
  lineId: string;
  lineName?: string;
  totalCoaches: number;
  reservableCoaches: number;
  totalSeats: number;
  coaches: CoachConfig[];
  createdAt: string;
}

// Pre-populated Sri Lanka Railway Stations
export const INITIAL_STATIONS: Station[] = [
  { id: 'st-1', name: 'Colombo Fort', code: 'FOT', location: 'Western Province' },
  { id: 'st-2', name: 'Kandy', code: 'KDA', location: 'Central Province' },
  { id: 'st-3', name: 'Nanu Oya', code: 'NOA', location: 'Central Province' },
  { id: 'st-4', name: 'Ella', code: 'ELL', location: 'Uva Province' },
  { id: 'st-5', name: 'Badulla', code: 'BDA', location: 'Uva Province' },
  { id: 'st-6', name: 'Galle', code: 'GLE', location: 'Southern Province' },
  { id: 'st-7', name: 'Matara', code: 'MTR', location: 'Southern Province' },
  { id: 'st-8', name: 'Jaffna', code: 'JAF', location: 'Northern Province' },
  { id: 'st-9', name: 'Kankesanthurai', code: 'KKE', location: 'Northern Province' },
  { id: 'st-10', name: 'Peradeniya', code: 'PDA', location: 'Central Province' },
];

// Pre-populated Sri Lanka Railway Lines
export const INITIAL_LINES: RailwayLine[] = [
  {
    id: 'line-1',
    name: 'Main Line (Colombo - Badulla)',
    startStationId: 'st-1',
    startStationName: 'Colombo Fort',
    startStationCode: 'FOT',
    endStationId: 'st-5',
    endStationName: 'Badulla',
    endStationCode: 'BDA',
    stations: [
      { stationId: 'st-1', stationName: 'Colombo Fort', stationCode: 'FOT', position: 1, distanceFromStart: 0 },
      { stationId: 'st-2', stationName: 'Kandy', stationCode: 'KDA', position: 2, distanceFromStart: 115 },
      { stationId: 'st-3', stationName: 'Nanu Oya', stationCode: 'NOA', position: 3, distanceFromStart: 206 },
      { stationId: 'st-4', stationName: 'Ella', stationCode: 'ELL', position: 4, distanceFromStart: 271 },
      { stationId: 'st-5', stationName: 'Badulla', stationCode: 'BDA', position: 5, distanceFromStart: 292 },
    ],
    createdAt: '2026-01-10',
  },
  {
    id: 'line-2',
    name: 'Coastal Line (Colombo - Matara)',
    startStationId: 'st-1',
    startStationName: 'Colombo Fort',
    startStationCode: 'FOT',
    endStationId: 'st-7',
    endStationName: 'Matara',
    endStationCode: 'MTR',
    stations: [
      { stationId: 'st-1', stationName: 'Colombo Fort', stationCode: 'FOT', position: 1, distanceFromStart: 0 },
      { stationId: 'st-6', stationName: 'Galle', stationCode: 'GLE', position: 2, distanceFromStart: 114 },
      { stationId: 'st-7', stationName: 'Matara', stationCode: 'MTR', position: 3, distanceFromStart: 160 },
    ],
    createdAt: '2026-01-12',
  },
  {
    id: 'line-3',
    name: 'Northern Line (Colombo - Kankesanthurai)',
    startStationId: 'st-1',
    startStationName: 'Colombo Fort',
    startStationCode: 'FOT',
    endStationId: 'st-9',
    endStationName: 'Kankesanthurai',
    endStationCode: 'KKE',
    stations: [
      { stationId: 'st-1', stationName: 'Colombo Fort', stationCode: 'FOT', position: 1, distanceFromStart: 0 },
      { stationId: 'st-8', stationName: 'Jaffna', stationCode: 'JAF', position: 2, distanceFromStart: 398 },
      { stationId: 'st-9', stationName: 'Kankesanthurai', stationCode: 'KKE', position: 3, distanceFromStart: 414 },
    ],
    createdAt: '2026-01-15',
  },
];

// Default 8-coach setup (3 reservable, 5 unreserved, 54 seats per coach)
export const generateDefaultCoaches = (totalCoaches = 8, reservableCount = 3, seatsPerCoach = 54): CoachConfig[] => {
  return Array.from({ length: totalCoaches }, (_, index) => {
    const position = index + 1;
    const isReserved = position <= reservableCount;
    return {
      id: `coach-${position}`,
      identifier: `Coach ${String.fromCharCode(65 + index)} (${isReserved ? 'Reserved' : 'Standard'})`,
      position,
      seatCount: seatsPerCoach,
      isReserved,
    };
  });
};

// Pre-populated Sri Lanka Trains
export const INITIAL_TRAINS: TrainConfig[] = [
  {
    id: 'trn-1',
    name: 'Podi Menike Express',
    trainNumber: '1005',
    lineId: 'line-1',
    lineName: 'Main Line (Colombo - Badulla)',
    totalCoaches: 8,
    reservableCoaches: 3,
    totalSeats: 432,
    coaches: generateDefaultCoaches(8, 3, 54),
    createdAt: '2026-01-20',
  },
  {
    id: 'trn-2',
    name: 'Udarata Menike Express',
    trainNumber: '1015',
    lineId: 'line-1',
    lineName: 'Main Line (Colombo - Badulla)',
    totalCoaches: 8,
    reservableCoaches: 3,
    totalSeats: 432,
    coaches: generateDefaultCoaches(8, 3, 54),
    createdAt: '2026-01-22',
  },
  {
    id: 'trn-3',
    name: 'Yal Devi Intercity',
    trainNumber: '4017',
    lineId: 'line-3',
    lineName: 'Northern Line (Colombo - Kankesanthurai)',
    totalCoaches: 8,
    reservableCoaches: 3,
    totalSeats: 432,
    coaches: generateDefaultCoaches(8, 3, 54),
    createdAt: '2026-01-25',
  },
];
