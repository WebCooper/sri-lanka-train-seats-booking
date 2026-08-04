'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, Loader2, Train } from 'lucide-react';
import {
  fetchUpcomingSchedulesApi,
  formatScheduleDate,
  formatScheduleTime,
} from '../lib/passengerApi';
import type { ScheduleSummary } from '../types/passenger';

export function UpcomingTrainsSection() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadUpcoming = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetchUpcomingSchedulesApi();
        setSchedules(response.schedules);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadUpcoming();
  }, []);

  return (
    <section className="relative z-10 w-full bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Clock3 className="h-3.5 w-3.5" />
              Live Departures
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Trains Departing Soon</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              The next scheduled departures across the network. Sign in to reserve a seat on any
              train below.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600"
          >
            <span>View booking portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Loading upcoming departures...</span>
          </div>
        ) : hasError ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Upcoming train schedules are temporarily unavailable. Please try again later.
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No upcoming scheduled trains found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {schedules.map((schedule) => (
              <article
                key={schedule.schedule_id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                      <Train className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                        (schedule.available_reserved_seats_count ?? 0) > 0
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {schedule.available_reserved_seats_count ?? 0} seats free
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{schedule.line.name}</h3>
                  <p className="mt-1 text-sm font-medium text-indigo-600">
                    {schedule.train.name} (#{schedule.train.train_number})
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatScheduleDate(schedule.departure_time)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Departs {formatScheduleTime(schedule.departure_time)} • Arrives{' '}
                    {formatScheduleTime(schedule.arrival_time)}
                  </p>
                </div>

                <Link
                  href="/login"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 transition-colors group-hover:text-indigo-700"
                >
                  <span>Sign in to book this train</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
