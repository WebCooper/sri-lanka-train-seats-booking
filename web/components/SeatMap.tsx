'use client';

import type { SeatAvailabilityCoach } from '../types/passenger';

interface SeatMapProps {
  coach: SeatAvailabilityCoach | null;
  selectedSeat: number | null;
  onSelectSeat: (seatNumber: number) => void;
}

export function SeatMap({ coach, selectedSeat, onSelectSeat }: SeatMapProps) {
  if (!coach) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Select a reserved coach to view seats.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Coach {coach.identifier}
        </h4>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-indigo-600" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-slate-300 bg-white" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-slate-200" /> Occupied
          </span>
        </div>
      </div>

      <div className="no-scrollbar grid max-h-[260px] grid-cols-6 gap-2.5 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {coach.seats.map((seat) => {
          const isSelected = selectedSeat === seat.seat_number;
          const isAvailable = seat.is_available;

          return (
            <button
              key={seat.seat_number}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSeat(seat.seat_number)}
              className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'cursor-pointer border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isAvailable
                    ? 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-indigo-400'
                    : 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400'
              }`}
            >
              {seat.seat_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
