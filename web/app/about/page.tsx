'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Train, ShieldCheck, Award, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

const ABOUT_HERO_IMAGE = '/cherrydeck-UpsEF48wAgk-unsplash.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative z-20 h-[min(52vh,28rem)] overflow-hidden sm:h-[min(58vh,32rem)]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={ABOUT_HERO_IMAGE}
            alt="Team collaborating on modern railway ticketing systems"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/60"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/70"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:text-xs">
              <Train className="h-3.5 w-3.5" />
              About Our Platform
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Sri Lanka Railways Online Ticketing
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Modernizing train seat reservations across Sri Lanka&apos;s 1,500+ kilometer railway network.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Our Story
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-2">
            Connecting Sri Lanka through Scenic Rail Travel
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            From coastal tracks along the Indian Ocean to mountain passes through Nuwara Eliya and Ella,
            millions of passengers rely on train travel every day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Sri Lanka Railways operates one of the most picturesque railway networks in Asia. From coastal
              tracks along the Indian Ocean to mountain passes winding through Nuwara Eliya and Ella, millions
              of passengers rely on train travel daily.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our official online seat booking portal allows local commuters and international travelers to
              check seat availability in real time, choose reserved coaches, and secure e-tickets seamlessly.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-500/30 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl">Key System Highlights</h3>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-slate-200 border-t border-indigo-700/50 pt-5">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Over 250+ railway stations integrated with distance matrices</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reserved 1st Class, 2nd Class, and Observation Car coaches</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR e-tickets delivered to email and passenger dashboard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official integration with Sri Lanka Railways Ministry</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mission Grid */}
      <section className="bg-white border-y border-slate-200/80 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Our Mission
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-2">
              Built for Passengers, Powered by Technology
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              A modern booking experience designed to make every journey across Sri Lanka simpler and more reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Train className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Punctuality & Convenience</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Eliminating physical queueing at station ticket counters by providing 24/7 online seat bookings.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Passenger Auth</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every booking is linked to passenger NIC/Passport credentials to prevent unauthorized seat resale.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Comfortable Travel</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Reserve specific coach seats in advance so families and tour groups travel together comfortably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Book Your Train Seat?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Sign up now for a free passenger account and explore all train routes across Sri Lanka.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all"
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
