'use client';

import type { ScheduleSummary } from '../types/passenger';
import { formatScheduleDate, formatScheduleTime } from '../lib/passengerApi';
import { Train } from 'lucide-react';

interface ScheduleResultsListProps {
  schedules: ScheduleSummary[];
  selectedScheduleId: string | null;
  onSelect: (schedule: ScheduleSummary) => void;
  emptyMessage?: string;
}

export function ScheduleResultsList({
  schedules,
  selectedScheduleId,
  onSelect,
  emptyMessage = 'No trains match your search.',
}: ScheduleResultsListProps) {
  if (schedules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => {
        const isSelected = selectedScheduleId === schedule.schedule_id;

        return (
          <button
            key={schedule.schedule_id}
            type="button"
            onClick={() => onSelect(schedule)}
            className={`w-full rounded-2xl border p-4 text-left transition-all ${
              isSelected
                ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Train className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">{schedule.train.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-indigo-600">{schedule.line.name}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    {formatScheduleDate(schedule.departure_time)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    DEPARTS {formatScheduleTime(schedule.departure_time)}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                {schedule.available_reserved_seats_count !== undefined
                  ? `${schedule.available_reserved_seats_count} seats free`
                  : 'Seats available'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
