'use client';

import React from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../components/PassengerLayout';
import { usePassengerAuth } from '../../context/PassengerAuthContext';
import { Ticket, Train, UserCheck, ArrowRight } from 'lucide-react';

export default function PassengerDashboard() {
  const { user } = usePassengerAuth();

  return (
    <PassengerLayout>
      <div>
        {/* Dashboard Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Welcome, {user?.name || user?.email?.split('@')[0] || 'Passenger'}
          </h1>
          <p className="text-sm text-slate-500">
            Select an option below to book train seats, view your reservations, or update your account details.
          </p>
        </div>

        {/* Option Cards Grid - Portrait 3 per row (Matching Admin Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {/* Card 1: Book a Seat */}
          <Link href="/dashboard/book-seat" className="no-underline flex h-full group">
            <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-200 hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
                    <Ticket className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                  Book a Seat
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Search live train schedules across Sri Lanka, select origin and destination stations, pick reserved coach seats, and generate instant e-tickets.
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Open Module</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Card 2: My Bookings */}
          <Link href="/dashboard/my-bookings" className="no-underline flex h-full group">
            <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 transition-all duration-200 hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-md shadow-sky-500/10">
                    <Train className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-sky-600 transition-colors">
                  My Bookings
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  View your active train seat reservations, download QR e-ticket passes, check journey schedules, and review your travel history.
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-sky-600 group-hover:text-sky-700">
                <span>Open Module</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Card 3: Profile Settings */}
          <Link href="/dashboard/profile" className="no-underline flex h-full group">
            <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-200 hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-emerald-600 transition-colors">
                  Profile Settings
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Manage your personal passenger details, update NIC/Passport verification numbers, mobile contact information, and account security.
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                <span>Open Module</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </PassengerLayout>
  );
}
