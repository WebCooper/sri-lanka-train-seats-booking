'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, Home, UserCheck } from 'lucide-react';
import { usePassengerAuth } from '../context/PassengerAuthContext';
import { BrandLogo } from './BrandLogo';

export const PassengerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, isPending, logout } = usePassengerAuth();

  useEffect(() => {
    if (!isPending && !user) {
      router.replace('/login');
    }
  }, [user, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Verifying passenger authentication session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar Header - Matching Admin Layout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/dashboard" imageClassName="h-10 w-auto" />

          {/* Right User Bar */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Public Home</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Passenger Role Pill */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-full">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">
                {user.name || user.email.split('@')[0]}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                PASSENGER
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
};
