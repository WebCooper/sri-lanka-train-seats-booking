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
  available_reserved_seats_count: number;
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
  date_from: string;
  date_to: string;
  origin: Station | null;
  destination: Station | null;
  total_schedules: number;
  schedules: ScheduleSummary[];
}

export interface SeatAvailabilitySeat {
  seat_number: number;
  is_available: boolean;
  is_reserved: boolean;
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

export interface SearchSchedulesParams {
  date?: string;
  date_from?: string;
  date_to?: string;
  origin_id?: string;
  destination_id?: string;
  line_id?: string;
  train_id?: string;
  train_name?: string;
}
