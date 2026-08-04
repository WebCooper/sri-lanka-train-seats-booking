import axiosInstance from './axiosInstance';

export interface StationRef {
  id: string;
  name: string;
  code: string;
}

export interface IntermediateStationRef {
  id: string;
  name: string;
  code: string;
  position: number;
  distance_from_start: number;
}

export interface LineScheduleRef {
  id: string;
  name: string;
  start_station?: StationRef | null;
  end_station?: StationRef | null;
  intermediate_stations?: IntermediateStationRef[];
}

export interface TrainScheduleRef {
  id: string;
  name: string;
  train_number: string;
  coach_count: number;
  total_seat_count: number;
}

export interface ScheduleItem {
  id: string;
  line: LineScheduleRef | null;
  train: TrainScheduleRef | null;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchedulePayload {
  line_id: string;
  train_id: string;
  departure_time: string;
  arrival_time: string;
}

export interface BulkCreateSchedulePayload {
  line_id: string;
  train_id: string;
  sessions: Array<{
    departure_time: string;
    arrival_time: string;
  }>;
}

export interface BulkCreateScheduleResult {
  created: ScheduleItem[];
  skipped: Array<{
    departure_time: string;
    arrival_time: string;
    reason: string;
  }>;
  total_created: number;
  total_skipped: number;
}

export interface UpdateSchedulePayload {
  line_id?: string;
  train_id?: string;
  departure_time?: string;
  arrival_time?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchSchedulesApi = async (params?: {
  page?: number;
  limit?: number;
  line_id?: string;
  train_id?: string;
  date_from?: string;
  date_to?: string;
}): Promise<PaginatedResponse<ScheduleItem>> => {
  const response = await axiosInstance.get<PaginatedResponse<ScheduleItem>>('/api/v1/admin/schedules', {
    params,
  });
  return response.data;
};

export const fetchScheduleByIdApi = async (id: string): Promise<ScheduleItem> => {
  const response = await axiosInstance.get<ScheduleItem>(`/api/v1/admin/schedules/${id}`);
  return response.data;
};

export const createScheduleApi = async (payload: CreateSchedulePayload): Promise<ScheduleItem> => {
  const response = await axiosInstance.post<ScheduleItem>('/api/v1/admin/schedules', payload);
  return response.data;
};

export const createBulkSchedulesApi = async (
  payload: BulkCreateSchedulePayload,
): Promise<BulkCreateScheduleResult> => {
  const response = await axiosInstance.post<BulkCreateScheduleResult>(
    '/api/v1/admin/schedules/bulk',
    payload,
  );
  return response.data;
};

export const updateScheduleApi = async (id: string, payload: UpdateSchedulePayload): Promise<ScheduleItem> => {
  const response = await axiosInstance.put<ScheduleItem>(`/api/v1/admin/schedules/${id}`, payload);
  return response.data;
};

export const deleteScheduleApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axiosInstance.delete<{ message: string; id: string }>(`/api/v1/admin/schedules/${id}`);
  return response.data;
};
