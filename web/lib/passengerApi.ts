import axiosInstance from './axiosInstance';
import type {
  BookingTicket,
  ConfirmBookingPayload,
  FareQuote,
  FareQuotePayload,
  HoldSeatPayload,
  HoldSeatResponse,
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

export const quoteFareApi = async (payload: FareQuotePayload): Promise<FareQuote> => {
  const response = await axiosInstance.post<FareQuote>('/api/v1/bookings/quote', payload);
  return response.data;
};

export const holdSeatApi = async (payload: HoldSeatPayload): Promise<HoldSeatResponse> => {
  const response = await axiosInstance.post<HoldSeatResponse>('/api/v1/bookings/hold', payload);
  return response.data;
};

export const confirmBookingApi = async (
  payload: ConfirmBookingPayload,
): Promise<BookingTicket> => {
  const response = await axiosInstance.post<BookingTicket>('/api/v1/bookings', payload);
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
