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
            className={`min-w-[9.5rem] rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            <span className="block text-sm font-bold leading-tight">
              {coachClassLabel(coach.coach_class)}
            </span>
            <span
              className={`mt-2 block text-xs font-semibold ${
                isSelected ? 'text-indigo-100' : 'text-emerald-600'
              }`}
            >
              {coach.available_seats_count} seat{coach.available_seats_count === 1 ? '' : 's'} available
            </span>
          </button>
        );
      })}
    </div>
  );
}
