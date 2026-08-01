'use client';

import React from 'react';
import Link from 'next/link';
import { Train, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Train className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white">Sri Lanka Railways</span>
              <span className="text-[10px] text-slate-400">Official Seat Booking System</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Reserve train seats online, view real-time train schedules, and manage e-tickets for comfortable travel across Sri Lanka.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
          <Link href="/" className="hover:text-white transition-colors">Home Page</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Railways</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Customer Contact</Link>
          <Link href="/login" className="hover:text-white transition-colors">Passenger Login</Link>
          <Link href="/register" className="hover:text-white transition-colors">Self Sign-Up</Link>
        </div>

        {/* Popular Routes */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Main Scenic Routes</h4>
          <span className="text-slate-400">Main Line: Colombo Fort - Badulla</span>
          <span className="text-slate-400">Coastal Line: Colombo - Matara</span>
          <span className="text-slate-400">Northern Line: Colombo - Jaffna</span>
          <span className="text-slate-400">Batticaloa Line: Colombo - Trincomalee</span>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Station Support</h4>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Railway Hotline: <strong>1981</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>support@railway.gov.lk</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Railway HQ, Colombo Fort, Sri Lanka</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <span>&copy; 2026 Sri Lanka Railways. All rights reserved.</span>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted & Verified Online Booking System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
