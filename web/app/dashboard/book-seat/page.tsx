'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { ChevronRight, Ticket, MapPin, Calendar, Search, Train, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookSeatPage() {
  const [origin, setOrigin] = useState('Colombo Fort');
  const [destination, setDestination] = useState('Badulla');
  const [travelDate, setTravelDate] = useState('2026-08-05');
  const [coachClass, setCoachClass] = useState('2nd Class Reserved');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(12);
  const [isReserving, setIsReserving] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Found 3 express trains running from ${origin} to ${destination}!`);
  };

  const handleReserveSeat = () => {
    if (!selectedSeat) {
      toast.error('Please select a seat number from the coach layout.');
      return;
    }

    setIsReserving(true);
    setTimeout(() => {
      setIsReserving(false);
      toast.success(`Seat #${selectedSeat} reserved successfully! E-ticket QR code generated.`);
    }, 1200);
  };

  return (
    <PassengerLayout>
      <div>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link href="/dashboard" className="text-indigo-600 hover:underline font-medium">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Book a Seat</span>
        </nav>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Reserve Train Seat
          </h1>
          <p className="text-sm text-slate-500">
            Search live train schedules, select your travel route, pick coach seats, and generate instant e-tickets.
          </p>
        </div>

        {/* Search & Reservation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Search Form */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Search Trains</h2>
                  <p className="text-xs text-slate-500">Select origin, destination & date</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col gap-4">
                {/* Origin */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Origin Station *</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-indigo-600 pointer-events-none" />
                    <select
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    >
                      <option value="Colombo Fort">Colombo Fort (FOT)</option>
                      <option value="Kandy">Kandy (KDA)</option>
                      <option value="Galle">Galle (GLE)</option>
                      <option value="Jaffna">Jaffna (JAF)</option>
                    </select>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Destination Station *</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-emerald-600 pointer-events-none" />
                    <select
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <option value="Badulla">Badulla (BDA)</option>
                      <option value="Ella">Ella (ELL)</option>
                      <option value="Nanu Oya">Nanu Oya (NOA)</option>
                      <option value="Matara">Matara (MTR)</option>
                      <option value="Kankesanthurai">Kankesanthurai (KKE)</option>
                    </select>
                  </div>
                </div>

                {/* Travel Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Travel Date *</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Coach Class */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Coach Class</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    value={coachClass}
                    onChange={(e) => setCoachClass(e.target.value)}
                  >
                    <option value="1st Class Observation">1st Class Observation (A/C)</option>
                    <option value="2nd Class Reserved">2nd Class Reserved (Reclining)</option>
                    <option value="3rd Class Reserved">3rd Class Reserved</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all mt-2"
                >
                  Search Available Trains
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Available Trains & Seat Selector */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                    <Train className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Podi Menike Express (#1005)</h3>
                    <p className="text-xs text-slate-500">
                      {origin} &rarr; {destination} • Departure 05:55 AM
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  LKR 1,200 / Seat
                </span>
              </div>

              {/* Interactive Coach Seat Map */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Coach Seat (Coach 1005-A)
                  </h4>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" /> Available
                    </span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-6 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-[220px] overflow-y-auto no-scrollbar">
                  {Array.from({ length: 24 }, (_, i) => {
                    const seatNum = i + 1;
                    const isSelected = selectedSeat === seatNum;
                    return (
                      <button
                        key={seatNum}
                        type="button"
                        onClick={() => setSelectedSeat(seatNum)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        Seat {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Reservation Action */}
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500">Selected Reservation:</span>
                <div className="text-sm font-bold text-slate-900">
                  Seat #{selectedSeat || 'None'} • {coachClass}
                </div>
              </div>

              <button
                type="button"
                onClick={handleReserveSeat}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-60"
                disabled={isReserving}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isReserving ? 'Confirming Seat...' : 'Confirm Seat Booking'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}
