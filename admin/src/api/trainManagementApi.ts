import axiosInstance from './axiosInstance';

// Station Models
export interface Station {
  id: string;
  name: string;
  code: string;
  location?: string | null;
  cumulativeDistance?: number;
}

export interface StationRef {
  id: string;
  name: string;
  code: string;
  location?: string | null;
}

export interface LineStationItem {
  id: string;
  name: string;
  code: string;
  location?: string | null;
  position: number;
  distance_from_start: number;
}

export interface RailwayLine {
  id: string;
  name: string;
  start_station: StationRef;
  end_station: StationRef;
  total_intermediate_stations?: number;
  stations: LineStationItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IntermediateStationPayload {
  station_id: string;
  distance_from_start?: number;
}

export interface CreateLinePayload {
  name: string;
  start_station_id: string;
  end_station_id: string;
  stations?: IntermediateStationPayload[];
}

export interface UpdateLinePayload {
  name?: string;
  start_station_id?: string;
  end_station_id?: string;
  stations?: IntermediateStationPayload[];
}

// API Response Wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Stations API
export const fetchStationsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Station>> => {
  const response = await axiosInstance.get<PaginatedResponse<Station>>('/api/v1/admin/stations', {
    params,
  });
  return response.data;
};

// Fetch All Stations (for select dropdowns in line creation)
export const fetchAllStationsApi = async (): Promise<Station[]> => {
  const response = await axiosInstance.get<PaginatedResponse<Station>>('/api/v1/admin/stations', {
    params: { page: 1, limit: 500 },
  });
  return response.data.data;
};

// Railway Lines API (GET, POST, PUT, DELETE /api/v1/admin/lines)
export const fetchLinesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<RailwayLine>> => {
  const response = await axiosInstance.get<PaginatedResponse<RailwayLine>>('/api/v1/admin/lines', {
    params,
  });
  return response.data;
};

export const fetchLineByIdApi = async (id: string): Promise<RailwayLine> => {
  const response = await axiosInstance.get<RailwayLine>(`/api/v1/admin/lines/${id}`);
  return response.data;
};

export const createLineApi = async (payload: CreateLinePayload): Promise<RailwayLine> => {
  const response = await axiosInstance.post<RailwayLine>('/api/v1/admin/lines', payload);
  return response.data;
};

export const updateLineApi = async (id: string, payload: UpdateLinePayload): Promise<RailwayLine> => {
  const response = await axiosInstance.put<RailwayLine>(`/api/v1/admin/lines/${id}`, payload);
  return response.data;
};

export const deleteLineApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axiosInstance.delete<{ message: string; id: string }>(`/api/v1/admin/lines/${id}`);
  return response.data;
};

// Train Configuration Models (UI Frontend state)
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
