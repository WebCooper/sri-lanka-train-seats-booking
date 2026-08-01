'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Train, ShieldCheck, Award, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* About Header */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-400/30 mb-4 inline-block">
            About Our Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Sri Lanka Railways Online Ticketing
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Modernizing train seat reservations across Sri Lanka's 1,500+ kilometer railway network.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full flex flex-col gap-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Connecting Sri Lanka through Scenic Rail Travel
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Sri Lanka Railways operates one of the most picturesque railway networks in Asia. From coastal tracks along the Indian Ocean to mountain passes winding through Nuwara Eliya and Ella, millions of passengers rely on train travel daily.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our official online seat booking portal allows local commuters and international travelers to check seat availability in real time, choose reserved coaches, and secure e-tickets seamlessly.
            </p>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">Key System Highlights</h3>
            </div>

            <ul className="flex flex-col gap-3 text-xs text-slate-200 border-t border-indigo-800/80 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Over 250+ railway stations integrated with distance matrices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reserved 1st Class, 2nd Class, and Observation Car coaches</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR e-tickets delivered to email and passenger dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official integration with Sri Lanka Railways Ministry</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-bold">
              <Train className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Punctuality & Convenience</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eliminating physical queueing at station ticket counters by providing 24/7 online seat bookings.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Secure Passenger Auth</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every booking is linked to passenger NIC/Passport credentials to prevent unauthorized seat resale.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Comfortable Travel</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reserve specific coach seats in advance so families and tour groups travel together comfortably.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white border border-slate-200/90 rounded-3xl p-10 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Book Your Train Seat?</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Sign up now for a free passenger account and explore all train routes across Sri Lanka.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Create Passenger Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
