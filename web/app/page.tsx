'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Train, Ticket, ShieldCheck, Clock, MapPin, ArrowRight, Search, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in">
            <Train className="w-4 h-4 text-indigo-400" />
            Official Sri Lanka Railways Online Seat Booking Portal
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Discover Sri Lanka by Rail with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Instant Online Seat Reservations
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Reserve 1st Class, 2nd Class, and Observation Car seats on express trains across Sri Lanka. Seamless e-tickets, transparent pricing, and instant seat confirmation.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Create Passenger Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-md transition-all"
            >
              <span>Passenger Sign In</span>
            </Link>
          </div>

          {/* Search Callout Box */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">From Station</label>
                <div className="flex items-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-xl">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-semibold">Colombo Fort (FOT)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">To Station</label>
                <div className="flex items-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-xl">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-semibold">Badulla (BDA)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Travel Date</label>
                <div className="flex items-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-xl">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-semibold">Tomorrow Express</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Available Trains & Reserve Seats</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Scenic Routes */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Network Coverage
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-2">
            Popular Railway Destinations
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Book seats on iconic express trains travelling across Sri Lanka's mountains, coasts, and heritage cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 font-bold text-sm">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Main Line Express</h3>
              <p className="text-xs text-indigo-600 font-semibold mb-3">Colombo Fort &rarr; Kandy &rarr; Ella &rarr; Badulla</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Experience world-famous mountain scenery, tea plantations, and the Nine Arch Bridge on Podi Menike & Udarata Menike.
              </p>
            </div>
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Observation & 1st Class</span>
              <span className="text-indigo-600">Daily Express</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-5 font-bold text-sm">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Southern Coastal Line</h3>
              <p className="text-xs text-sky-600 font-semibold mb-3">Colombo Fort &rarr; Bentota &rarr; Galle &rarr; Matara</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Travel along the Indian Ocean coastline straight to Galle Dutch Fort and Southern golden beaches.
              </p>
            </div>
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Ruhunu Kumari Express</span>
              <span className="text-sky-600">Daily Commuter</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-bold text-sm">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Northern Express</h3>
              <p className="text-xs text-emerald-600 font-semibold mb-3">Colombo Fort &rarr; Anuradhapura &rarr; Jaffna</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Fast air-conditioned Intercity trains connecting Colombo to ancient capitals and the Northern peninsula.
              </p>
            </div>
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Yal Devi Intercity</span>
              <span className="text-emerald-600">Air Conditioned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white border-y border-slate-200/80 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Instant E-Tickets</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Receive instant QR code seat passes sent to your email and dashboard.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Guaranteed Seats</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Reserved coaches ensure your specific seat is locked and protected.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Live Timetables</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Check up-to-date train arrival times and intermediate station stops.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Official Portal</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Direct integration with Sri Lanka Railways ticketing system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-extrabold mb-4">Ready for Your Train Journey?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Create a passenger account in less than a minute and reserve seats on any Sri Lankan train.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all"
          >
            <span>Register Passenger Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
