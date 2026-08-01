'use client';

import type { SeatAvailabilityCoach } from '../types/passenger';

interface CoachSelectorProps {
  coaches: SeatAvailabilityCoach[];
  selectedCoachId: string | null;
  onSelect: (coachId: string) => void;
}

export function CoachSelector({
  coaches,
  selectedCoachId,
  onSelect,
}: CoachSelectorProps) {
  if (coaches.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No reserved coaches are configured for this train.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {coaches.map((coach) => {
        const isSelected = selectedCoachId === coach.coach_id;

        return (
          <button
            key={coach.coach_id}
            type="button"
            onClick={() => onSelect(coach.coach_id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            Coach {coach.identifier} ({coach.available_seats_count}/{coach.seat_count})
          </button>
        );
      })}
    </div>
  );
}
