'use client';

import React from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { ChevronRight, Train, QrCode, Calendar, MapPin, CheckCircle, Ticket } from 'lucide-react';

export default function MyBookingsPage() {
  const sampleBookings = [
    {
      id: 'BK-99201',
      trainName: 'Podi Menike Express',
      trainNumber: '1005',
      route: 'Colombo Fort to Badulla',
      travelDate: '2026-08-05',
      seat: 'Coach 1005-A • Seat 12',
      class: '2nd Class Reserved',
      status: 'CONFIRMED',
      fare: 'LKR 1,200',
    },
    {
      id: 'BK-88104',
      trainName: 'Udarata Menike Express',
      trainNumber: '1015',
      route: 'Kandy to Nanu Oya',
      travelDate: '2026-07-28',
      seat: 'Coach 1015-B • Seat 08',
      class: '1st Class Observation',
      status: 'COMPLETED',
      fare: 'LKR 1,800',
    },
  ];

  return (
    <PassengerLayout>
      <div>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link href="/dashboard" className="text-indigo-600 hover:underline font-medium">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">My Bookings</span>
        </nav>

        {/* Heading */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              My Seat Reservations & E-Tickets
            </h1>
            <p className="text-sm text-slate-500">
              Manage active train seat bookings, download QR e-ticket passes, and review travel history.
            </p>
          </div>

          <Link
            href="/dashboard/book-seat"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Ticket className="w-4 h-4" />
            <span>Book New Seat</span>
          </Link>
        </div>

        {/* Bookings List */}
        <div className="flex flex-col gap-6">
          {sampleBookings.map((bk) => (
            <div
              key={bk.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Train className="w-7 h-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-slate-900">{bk.trainName}</span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">(#{bk.trainNumber})</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        bk.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>{bk.route}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {bk.travelDate}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    Seat: <span className="text-indigo-600">{bk.seat}</span> • {bk.class}
                  </div>
                </div>
              </div>

              {/* Right Action & QR Code */}
              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-end border-slate-100">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Ref: {bk.id}</div>
                  <div className="text-sm font-bold text-slate-900">{bk.fare}</div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>View E-Ticket QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PassengerLayout>
  );
}
