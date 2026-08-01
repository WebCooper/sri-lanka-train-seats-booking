import axiosInstance from './axiosInstance';
import type {
  Line,
  SearchSchedulesParams,
  SearchSchedulesResponse,
  SeatAvailabilityResponse,
  Station,
  Train,
  UpcomingSchedulesResponse,
} from '../types/passenger';

export const fetchStationsApi = async (): Promise<Station[]> => {
  const response = await axiosInstance.get<Station[]>('/api/v1/stations');
  return response.data;
};

export const fetchLinesApi = async (): Promise<Line[]> => {
  const response = await axiosInstance.get<Line[]>('/api/v1/lines');
  return response.data;
};

export const fetchTrainsApi = async (params?: {
  line_id?: string;
  search?: string;
}): Promise<Train[]> => {
  const response = await axiosInstance.get<Train[]>('/api/v1/trains', { params });
  return response.data;
};

export const fetchUpcomingSchedulesApi = async (): Promise<UpcomingSchedulesResponse> => {
  const response = await axiosInstance.get<UpcomingSchedulesResponse>(
    '/api/v1/schedules/upcoming',
  );
  return response.data;
};

export const searchSchedulesApi = async (
  params: SearchSchedulesParams,
): Promise<SearchSchedulesResponse> => {
  const response = await axiosInstance.get<SearchSchedulesResponse>('/api/v1/schedules', {
    params,
  });
  return response.data;
};

export const fetchSeatAvailabilityApi = async (
  scheduleId: string,
  params: { origin_id: string; destination_id: string },
): Promise<SeatAvailabilityResponse> => {
  const response = await axiosInstance.get<SeatAvailabilityResponse>(
    `/api/v1/schedules/${scheduleId}/seats`,
    { params },
  );
  return response.data;
};

export const formatScheduleTime = (isoDate: string): string => {
  return new Date(isoDate).toLocaleTimeString('en-LK', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatScheduleDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('en-LK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
