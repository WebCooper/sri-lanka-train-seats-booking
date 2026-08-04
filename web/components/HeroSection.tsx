'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Train } from 'lucide-react';
import { usePassengerAuth } from '../context/PassengerAuthContext';
import { HeroSearchBar } from './HeroSearchBar';

const HERO_IMAGE = '/minura-wijesena-ECWxeU9A7uY-unsplash.jpg';

export function HeroSection() {
  const { user } = usePassengerAuth();

  return (
    <section className="relative z-20 h-[calc(100vh-5rem)] overflow-hidden supports-[height:100dvh]:h-[calc(100dvh-5rem)]">
      {/* Background — overflow hidden only on image layer */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Blue train curving through lush green hills in Sri Lanka"
          fill
          priority
          className="object-cover object-[center_40%] sm:object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-900/15 to-slate-900/65"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/50"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4 lg:py-5">
        {/* Hero text — fills remaining space above search */}
        <div className="flex min-h-0 flex-1 items-center overflow-hidden">
          <div className="flex w-full justify-end">
            <div className="w-full max-w-xl text-center lg:max-w-lg lg:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:text-xs">
                <Train className="h-3.5 w-3.5" />
                Sri Lanka Railways
              </span>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl lg:text-[2.35rem] lg:leading-tight">
                Reserve train seats online across Sri Lanka
              </h1>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-200 sm:mt-3 sm:line-clamp-none sm:text-sm lg:text-base">
                Search live schedules, pick your coach and seat, and receive instant QR e-tickets —
                the same streamlined experience used across our passenger portal.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:justify-center sm:gap-3 lg:justify-end">
                {user ? (
                  <Link
                    href="/dashboard/book-seat"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 sm:px-6 sm:py-3"
                  >
                    <span>Book a Seat</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 sm:px-6 sm:py-3"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-6 sm:py-3"
                    >
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Find train — pinned to bottom inside hero */}
        <div className="shrink-0 pt-2 sm:pt-3">
          <HeroSearchBar />
        </div>
      </div>
    </section>
  );
}
