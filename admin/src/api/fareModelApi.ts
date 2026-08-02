import axiosInstance from './axiosInstance';

export interface CoachClassMultiplier {
  coach_class: string;
  multiplier: number;
}

export interface PeakHourRule {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  multiplier: number;
  days_of_week: number[];
  created_at?: string;
  updated_at?: string;
}

export interface FareModelConfig {
  flat_booking_fee: number;
  rate_per_km: number;
  off_peak_multiplier: number;
  coach_class_multipliers: CoachClassMultiplier[];
  peak_hour_rules: PeakHourRule[];
  formula: string;
}

export interface UpdateFareModelPayload {
  flat_booking_fee: number;
  rate_per_km: number;
  off_peak_multiplier: number;
  coach_class_multipliers: CoachClassMultiplier[];
}

export interface CreatePeakHourRulePayload {
  name: string;
  start_time: string;
  end_time: string;
  multiplier: number;
  days_of_week?: number[];
}

export interface UpdatePeakHourRulePayload {
  name?: string;
  start_time?: string;
  end_time?: string;
  multiplier?: number;
  days_of_week?: number[];
}

export interface FareQuotePayload {
  line_id: string;
  origin_station_id: string;
  destination_station_id: string;
  coach_class: string;
  departure_time: string;
}

export interface FareQuoteResult {
  flat_booking_fee: number;
  distance_km: number;
  distance_charge: number;
  base_amount: number;
  coach_class: string;
  coach_class_multiplier: number;
  time_multiplier: number;
  time_band: 'peak' | 'off_peak';
  fare_amount: number;
  currency: string;
  formula: string;
}

export const fetchFareModelApi = async (): Promise<FareModelConfig> => {
  const response = await axiosInstance.get<FareModelConfig>('/api/v1/admin/fare-model');
  return response.data;
};

export const updateFareModelApi = async (
  payload: UpdateFareModelPayload,
): Promise<FareModelConfig> => {
  const response = await axiosInstance.put<FareModelConfig>('/api/v1/admin/fare-model', payload);
  return response.data;
};

export const createPeakHourRuleApi = async (
  payload: CreatePeakHourRulePayload,
): Promise<PeakHourRule> => {
  const response = await axiosInstance.post<PeakHourRule>(
    '/api/v1/admin/fare-model/peak-rules',
    payload,
  );
  return response.data;
};

export const updatePeakHourRuleApi = async (
  id: string,
  payload: UpdatePeakHourRulePayload,
): Promise<PeakHourRule> => {
  const response = await axiosInstance.put<PeakHourRule>(
    `/api/v1/admin/fare-model/peak-rules/${id}`,
    payload,
  );
  return response.data;
};

export const deletePeakHourRuleApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/admin/fare-model/peak-rules/${id}`);
};

export const quoteFareApi = async (payload: FareQuotePayload): Promise<FareQuoteResult> => {
  const response = await axiosInstance.post<FareQuoteResult>(
    '/api/v1/admin/fare-model/quote',
    payload,
  );
  return response.data;
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const COACH_CLASS_LABELS: Record<string, string> = {
  FIRST: '1st Class (AC Saloon)',
  SECOND: '2nd Class',
  THIRD: '3rd Class',
  OBSERVATION: 'Observation Car',
};
