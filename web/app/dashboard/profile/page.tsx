'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { usePassengerAuth } from '../../../context/PassengerAuthContext';
import { ChevronRight, User, Mail, IdCard, Phone, Lock, Save, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchPassengerProfileApi, updatePassengerProfileApi } from '../../../lib/passengerApi';
import { getApiErrorMessage } from '../../../lib/axiosInstance';
import { authClient } from '../../../lib/auth-client';

export default function ProfilePage() {
  const { user } = usePassengerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPassengerProfileApi()
      .then((profile) => {
        if (!cancelled) {
          setName(profile.name);
          setEmail(profile.email);
          setNicNumber(profile.nic_number ?? '');
          setMobileNumber(profile.mobile_number ?? '');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, 'Could not load your profile.'));
          if (user) {
            setName(user.name);
            setEmail(user.email);
            setNicNumber(user.nic_number ?? '');
            setMobileNumber(user.mobile_number ?? '');
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updatePassengerProfileApi({
        name: name.trim(),
        nic_number: nicNumber.trim(),
        mobile_number: mobileNumber.trim(),
        ...(newPassword.trim()
          ? {
              current_password: currentPassword.trim(),
              new_password: newPassword.trim(),
            }
          : {}),
      });

      setName(updated.name);
      setEmail(updated.email);
      setNicNumber(updated.nic_number ?? '');
      setMobileNumber(updated.mobile_number ?? '');
      setCurrentPassword('');
      setNewPassword('');

      await authClient.getSession();
      toast.success('Passenger profile updated successfully!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save profile changes.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PassengerLayout>
      <div>
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/dashboard" className="font-medium text-indigo-600 hover:underline">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-700">Profile Settings</span>
        </nav>

        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
            Passenger Profile Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your personal profile information, update NIC number, mobile contact, and security
            credentials.
          </p>
        </div>

        <div className="max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <span>Loading your profile...</span>
            </div>
          ) : (
            <>
              {loadError && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <div className="relative flex items-center">
                    <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address (Primary)</label>
                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-11 pr-4 text-sm text-slate-500 outline-none"
                      value={email}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    NIC / Passport Verification Number
                  </label>
                  <div className="relative flex items-center">
                    <IdCard className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="199512345678"
                      value={nicNumber}
                      onChange={(event) => setNicNumber(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mobile Contact Number</label>
                  <div className="relative flex items-center">
                    <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="+94771234567"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="Required only when changing password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">New Password (Optional)</label>
                  <div className="relative flex items-center">
                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="Leave blank to keep current password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={isSaving}
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="submit"
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </PassengerLayout>
  );
}
