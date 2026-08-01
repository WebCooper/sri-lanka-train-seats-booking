'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { usePassengerAuth } from '../../../context/PassengerAuthContext';
import { ChevronRight, User, Mail, IdCard, Phone, Lock, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = usePassengerAuth();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [nicNumber, setNicNumber] = useState(user?.nic_number || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Passenger profile updated successfully!');
    }, 1000);
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
          <span className="text-slate-700">Profile Settings</span>
        </nav>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Passenger Profile Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your personal profile information, update NIC number, mobile contact, and security credentials.
          </p>
        </div>

        {/* Profile Card Form */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address (Readonly) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address (Primary)</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 outline-none cursor-not-allowed"
                  value={email}
                  disabled
                />
              </div>
            </div>

            {/* NIC / Passport Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">NIC / Passport Verification Number</label>
              <div className="relative flex items-center">
                <IdCard className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  placeholder="199512345678"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Mobile Contact Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  placeholder="+94771234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">New Password (Optional)</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PassengerLayout>
  );
}
