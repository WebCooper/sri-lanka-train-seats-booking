export interface Station {
  id: string;
  name: string;
  code: string;
  location?: string | null;
}

export interface LineStation extends Station {
  position: number;
  distance_from_start: number;
}

export interface Line {
  id: string;
  name: string;
  start_station: Station;
  end_station: Station;
  stations: LineStation[];
}

export interface TrainCoach {
  id: string;
  identifier: string;
  seat_count: number;
  is_reserved: boolean;
  coach_class: string;
  seat_configuration: string;
  position: number;
}

export interface Train {
  id: string;
  name: string;
  train_number: string;
  line: { id: string; name: string } | null;
  coach_count: number;
  reserved_coach_count: number;
  total_reserved_seat_count: number;
  coaches: TrainCoach[];
}

export interface ScheduleSummary {
  schedule_id: string;
  train: {
    id: string;
    name: string;
    train_number: string;
  };
  line: {
    id: string;
    name: string;
    start_station: Station;
    end_station: Station;
  };
  departure_time: string;
  arrival_time: string;
  travel_date: string;
  duration_minutes: number;
  total_reserved_seat_capacity: number;
  available_reserved_seats_count?: number;
  has_available_seats?: boolean;
  segment: {
    origin_id: string;
    destination_id: string;
  };
}

export interface UpcomingSchedulesResponse {
  as_of: string;
  total: number;
  schedules: ScheduleSummary[];
}

export interface SearchSchedulesResponse {
  date: string;
  origin: Station;
  destination: Station;
  total_schedules: number;
  schedules: ScheduleSummary[];
}

export interface SeatAvailabilitySeat {
  seat_number: number;
  is_available: boolean;
  is_reserved: boolean;
}

export type SeatVisualState =
  | 'available'
  | 'selected'
  | 'holding'
  | 'lost'
  | 'occupied';

export interface FareQuote {
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
}

export interface HoldSeatPayload {
  schedule_id: string;
  coach_id: string;
  seat_number: number;
  origin_id: string;
  destination_id: string;
}

export interface HoldSeatResponse {
  hold_id: string;
  schedule_id: string;
  coach_id: string;
  seat_number: number;
  origin_station: Station;
  destination_station: Station;
  expires_at: string;
  fare_quote: FareQuote;
  message: string;
}

export interface FareQuotePayload {
  schedule_id: string;
  origin_station_id: string;
  destination_station_id: string;
  coach_class: string;
}

export interface SeatAvailabilityCoach {
  coach_id: string;
  identifier: string;
  position: number;
  seat_count: number;
  available_seats_count: number;
  is_reserved: boolean;
  coach_class: string;
  seat_configuration: string;
  seats: SeatAvailabilitySeat[];
}

export interface SeatAvailabilityResponse {
  schedule_id: string;
  train: {
    id: string;
    name: string;
    train_number: string;
  };
  line: {
    id: string;
    name: string;
  };
  origin: Station | null;
  destination: Station | null;
  departure_time: string;
  arrival_time: string;
  available_reserved_seats_count: number;
  coaches: SeatAvailabilityCoach[];
}

export interface ConfirmBookingPayload {
  hold_id: string;
  passenger_details: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BookingTicket {
  booking_id: string;
  booking_reference: string;
  status: string;
  fare_amount: number;
  passenger: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  journey_details: {
    schedule_id: string;
    train_name: string;
    train_number: string;
    line_name: string;
    origin_station: Station;
    destination_station: Station;
    departure_time: string;
    arrival_time: string;
  };
  seat_details: {
    coach_id: string;
    coach_identifier: string;
    seat_number: number;
    is_reserved_class: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchSchedulesParams {
  date: string;
  origin_id: string;
  destination_id: string;
}
