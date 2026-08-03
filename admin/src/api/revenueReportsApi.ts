import axiosInstance from './axiosInstance';

export type RevenueGranularity = 'daily' | 'weekly' | 'monthly';

export interface RevenueFilters {
  date_from?: string;
  date_to?: string;
  line_id?: string;
  schedule_id?: string;
  train_id?: string;
}

export interface RevenueSummary {
  gross_revenue: number;
  booking_count: number;
  segment_count: number;
  average_fare: number;
  filters: Record<string, string | null>;
}

export interface RevenueOverTimePoint {
  period: string;
  revenue: number;
  booking_count: number;
}

export interface RevenueOverTime {
  granularity: RevenueGranularity;
  series: RevenueOverTimePoint[];
  totals: { revenue: number; booking_count: number };
  filters: Record<string, string | null>;
}

export interface RevenueByScheduleItem {
  schedule_id: string;
  train_number: string | null;
  train_name: string | null;
  line_name: string | null;
  departure_time: string | null;
  revenue: number;
  booking_count: number;
  average_fare: number;
}

export interface RevenueBySchedule {
  items: RevenueByScheduleItem[];
  total_schedules: number;
  filters: Record<string, string | null>;
}

export interface RevenueByCoachClassItem {
  coach_class: string;
  revenue: number;
  booking_count: number;
  share_percent: number;
  average_fare: number;
}

export interface RevenueByCoachClass {
  items: RevenueByCoachClassItem[];
  gross_revenue: number;
  filters: Record<string, string | null>;
}

export interface SegmentEfficiencyItem {
  schedule_id: string;
  train_number: string | null;
  line_name: string | null;
  coach_id: string;
  coach_identifier: string | null;
  seat_number: number;
  segment_count: number;
  total_fare_collected: number;
  segments: Array<{
    origin_station: string;
    destination_station: string;
    fare_amount: number;
  }>;
}

export interface SegmentEfficiency {
  summary: {
    seats_analyzed: number;
    multi_segment_seats: number;
    multi_segment_revenue: number;
    average_segments_per_seat: number;
  };
  items: SegmentEfficiencyItem[];
  filters: Record<string, string | null>;
}

const buildParams = (filters: object) => {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params[key] = String(value);
    }
  }
  return params;
};

export const fetchRevenueSummaryApi = async (
  filters: RevenueFilters = {},
): Promise<RevenueSummary> => {
  const response = await axiosInstance.get<RevenueSummary>(
    '/api/v1/admin/reports/revenue/summary',
    { params: buildParams({ ...filters }) },
  );
  return response.data;
};

export const fetchRevenueOverTimeApi = async (
  filters: RevenueFilters & { granularity?: RevenueGranularity } = {},
): Promise<RevenueOverTime> => {
  const response = await axiosInstance.get<RevenueOverTime>(
    '/api/v1/admin/reports/revenue/over-time',
    { params: buildParams({ ...filters }) },
  );
  return response.data;
};

export const fetchRevenueByScheduleApi = async (
  filters: RevenueFilters & { limit?: number } = {},
): Promise<RevenueBySchedule> => {
  const response = await axiosInstance.get<RevenueBySchedule>(
    '/api/v1/admin/reports/revenue/by-schedule',
    { params: buildParams({ limit: 10, ...filters }) },
  );
  return response.data;
};

export const fetchRevenueByCoachClassApi = async (
  filters: RevenueFilters = {},
): Promise<RevenueByCoachClass> => {
  const response = await axiosInstance.get<RevenueByCoachClass>(
    '/api/v1/admin/reports/revenue/by-coach-class',
    { params: buildParams({ ...filters }) },
  );
  return response.data;
};

export const fetchSegmentEfficiencyApi = async (
  filters: RevenueFilters & { min_segments?: number; limit?: number } = {},
): Promise<SegmentEfficiency> => {
  const response = await axiosInstance.get<SegmentEfficiency>(
    '/api/v1/admin/reports/revenue/segment-efficiency',
    { params: buildParams({ min_segments: 2, limit: 10, ...filters }) },
  );
  return response.data;
};
