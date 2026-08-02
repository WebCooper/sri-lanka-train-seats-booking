'use client';

import type { SeatAvailabilityCoach } from '../types/passenger';
import { COACH_CLASS_LABELS } from '../lib/coachLayout';

interface CoachSelectorProps {
  coaches: SeatAvailabilityCoach[];
  selectedCoachId: string | null;
  onSelect: (coachId: string) => void;
  disabled?: boolean;
}

function coachClassLabel(coachClass: string): string {
  return COACH_CLASS_LABELS[coachClass] ?? coachClass;
}

export function CoachSelector({
  coaches,
  selectedCoachId,
  onSelect,
  disabled = false,
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
            disabled={disabled}
            onClick={() => onSelect(coach.coach_id)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            <span className="block text-xs font-bold">
              Coach {coach.identifier}
            </span>
            <span
              className={`mt-0.5 block text-[10px] font-semibold ${
                isSelected ? 'text-indigo-100' : 'text-indigo-600'
              }`}
            >
              {coachClassLabel(coach.coach_class)} • {coach.seat_configuration} layout
            </span>
            <span
              className={`mt-1 block text-[10px] ${
                isSelected ? 'text-indigo-100/90' : 'text-slate-500'
              }`}
            >
              {coach.available_seats_count}/{coach.seat_count} seats available
            </span>
          </button>
        );
      })}
    </div>
  );
}
