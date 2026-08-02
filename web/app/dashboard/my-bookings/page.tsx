'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import {
  ChevronRight,
  Train,
  Calendar,
  MapPin,
  Ticket,
  Loader2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { fetchMyBookingsApi, formatScheduleDate, formatScheduleTime } from '../../../lib/passengerApi';
import { getApiErrorMessage } from '../../../lib/axiosInstance';
import { COACH_CLASS_LABELS } from '../../../lib/coachLayout';
import type { BookingTicket } from '../../../types/passenger';

function coachClassLabel(coachClass: string): string {
  return COACH_CLASS_LABELS[coachClass] ?? coachClass.replace(/_/g, ' ');
}

function bookingDisplayStatus(booking: BookingTicket): 'UPCOMING' | 'COMPLETED' {
  const departure = new Date(booking.journey_details.departure_time).getTime();
  return departure > Date.now() ? 'UPCOMING' : 'COMPLETED';
}

function formatFare(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMyBookingsApi()
      .then((response) => {
        if (!cancelled) {
          setBookings(response.bookings);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load your bookings.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PassengerLayout>
      <div>
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/dashboard" className="font-medium text-indigo-600 hover:underline">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-700">My Bookings</span>
        </nav>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
              My Seat Reservations & E-Tickets
            </h1>
            <p className="text-sm text-slate-500">
              View your confirmed seat bookings, journey details, and fare history.
            </p>
          </div>

          <Link
            href="/dashboard/book-seat"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
          >
            <Ticket className="h-4 w-4" />
            <span>Book New Seat</span>
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Loading your bookings...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Could not load bookings</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Ticket className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No bookings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              When you confirm a seat, it will appear here with your coach, seat number, and booking
              reference.
            </p>
            <Link
              href="/dashboard/book-seat"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Train className="h-4 w-4" />
              Book a seat
            </Link>
          </div>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookings.map((booking) => {
              const displayStatus = bookingDisplayStatus(booking);
              const { journey_details: journey, seat_details: seat } = booking;

              return (
                <article
                  key={booking.booking_id}
                  className="flex min-h-[22rem] flex-col rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Train className="h-6 w-6" />
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                        displayStatus === 'UPCOMING'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col gap-3">
                    <div>
                      <h2 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
                        {journey.train_name}
                      </h2>
                      <p className="mt-0.5 font-mono text-xs font-semibold text-slate-500">
                        #{journey.train_number}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                        <span className="font-semibold text-slate-800">
                          {journey.origin_station.name} → {journey.destination_station.name}
                        </span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>
                          {formatScheduleDate(journey.departure_time)}
                          <br />
                          {formatScheduleTime(journey.departure_time)}
                        </span>
                      </p>
                      <p className="line-clamp-2 text-slate-500">{journey.line_name}</p>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        Your seat
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        Coach {seat.coach_identifier}
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">Seat {seat.seat_number}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {coachClassLabel(seat.coach_class)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="font-mono text-xs font-semibold text-slate-700">
                        {booking.booking_reference}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatFare(booking.fare_amount)}
                      </p>
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
                        <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>
                          Paid {formatScheduleDate(booking.createdAt)} at{' '}
                          {formatScheduleTime(booking.createdAt)}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled
                      title="E-ticket view coming soon"
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-500 opacity-70"
                    >
                      <Ticket className="h-4 w-4 text-slate-400" />
                      <span>View E-ticket</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PassengerLayout>
  );
}
