import axiosInstance from './axiosInstance';
import axios from 'axios';

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

// API Response Wrapper
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

// Coach Models & APIs (/api/v1/admin/coaches)
export interface CoachItem {
  id: string;
  identifier: string;
  seat_count: number;
  is_reserved: boolean;
  position?: number;
  attached_trains_count?: number;
}

export interface CreateCoachPayload {
  identifier: string;
  seat_count: number;
  is_reserved?: boolean;
}

export interface UpdateCoachPayload {
  identifier?: string;
  seat_count?: number;
  is_reserved?: boolean;
}

export const fetchCoachesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  is_reserved?: boolean;
}): Promise<PaginatedResponse<CoachItem>> => {
  const response = await axiosInstance.get<PaginatedResponse<CoachItem>>('/api/v1/admin/coaches', {
    params,
  });
  return response.data;
};

export const createCoachApi = async (payload: CreateCoachPayload): Promise<CoachItem> => {
  const response = await axiosInstance.post<CoachItem>('/api/v1/admin/coaches', payload);
  return response.data;
};

export const updateCoachApi = async (id: string, payload: UpdateCoachPayload): Promise<CoachItem> => {
  const response = await axiosInstance.put<CoachItem>(`/api/v1/admin/coaches/${id}`, payload);
  return response.data;
};

export const deleteCoachApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axiosInstance.delete<{ message: string; id: string }>(`/api/v1/admin/coaches/${id}`);
  return response.data;
};

/**
 * Ensures a coach exists in DB with given identifier, seat count & reservation status.
 * If coach exists (409 conflict), updates its properties and returns coach ID.
 */
export const ensureCoachApi = async (
  identifier: string,
  seatCount: number,
  isReserved: boolean
): Promise<string> => {
  const cleanIdentifier = identifier.trim().toUpperCase();
  try {
    const created = await createCoachApi({
      identifier: cleanIdentifier,
      seat_count: seatCount,
      is_reserved: isReserved,
    });
    return created.id;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      // Find existing coach by searching exact identifier
      const searchRes = await fetchCoachesApi({ search: cleanIdentifier, limit: 10 });
      const matched = searchRes.data.find((c) => c.identifier.toUpperCase() === cleanIdentifier);
      if (matched) {
        await updateCoachApi(matched.id, {
          seat_count: seatCount,
          is_reserved: isReserved,
        });
        return matched.id;
      }
    }
    throw err;
  }
};

// Train Models & APIs (/api/v1/admin/trains)
export interface LineRef {
  id: string;
  name: string;
}

export interface TrainConfig {
  id: string;
  name: string;
  train_number: string;
  line?: LineRef | null;
  coach_count: number;
  total_seat_count: number;
  coaches: CoachItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainPayload {
  name: string;
  train_number: string;
  line_id?: string;
  coach_ids?: string[];
}

export interface UpdateTrainPayload {
  name?: string;
  train_number?: string;
  line_id?: string;
  coach_ids?: string[];
}

export const fetchTrainsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  line_id?: string;
}): Promise<PaginatedResponse<TrainConfig>> => {
  const response = await axiosInstance.get<PaginatedResponse<TrainConfig>>('/api/v1/admin/trains', {
    params,
  });
  return response.data;
};

export const fetchTrainByIdApi = async (id: string): Promise<TrainConfig> => {
  const response = await axiosInstance.get<TrainConfig>(`/api/v1/admin/trains/${id}`);
  return response.data;
};

export const createTrainApi = async (payload: CreateTrainPayload): Promise<TrainConfig> => {
  const response = await axiosInstance.post<TrainConfig>('/api/v1/admin/trains', payload);
  return response.data;
};

export const updateTrainApi = async (id: string, payload: UpdateTrainPayload): Promise<TrainConfig> => {
  const response = await axiosInstance.put<TrainConfig>(`/api/v1/admin/trains/${id}`, payload);
  return response.data;
};

export const deleteTrainApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axiosInstance.delete<{ message: string; id: string }>(`/api/v1/admin/trains/${id}`);
  return response.data;
};

// Helper to generate default coaches array with "train number - alphabetical order"
export interface FormCoachState {
  id?: string;
  identifier: string;
  seatCount: number;
  isReserved: boolean;
  position: number;
}

export const generateDefaultCoaches = (
  trainNumber = '1005',
  totalCoaches = 8,
  reservableCount = 3,
  seatsPerCoach = 54
): FormCoachState[] => {
  const cleanNum = trainNumber.trim() || '1005';
  return Array.from({ length: totalCoaches }, (_, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C...
    const position = index + 1;
    const isReserved = position <= reservableCount;
    return {
      identifier: `${cleanNum}-${letter}`,
      position,
      seatCount: seatsPerCoach,
      isReserved,
    };
  });
};
