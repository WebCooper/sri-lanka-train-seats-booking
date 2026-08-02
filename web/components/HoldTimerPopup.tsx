'use client';

import { Clock, CreditCard } from 'lucide-react';
import { formatCountdown } from '../lib/formatCountdown';

interface HoldTimerPopupProps {
  countdownMs: number;
  seatNumber: number;
  onPayNow: () => void;
}

export function HoldTimerPopup({ countdownMs, seatNumber, onPayNow }: HoldTimerPopupProps) {
  const isUrgent = countdownMs <= 2 * 60 * 1000;

  return (
    <div
      className={`fixed bottom-4 left-4 z-[60] w-[min(100vw-2rem,22rem)] rounded-2xl border px-4 py-3 shadow-lg shadow-slate-900/10 transition-all ${
        isUrgent
          ? 'border-amber-300 bg-amber-50'
          : 'border-emerald-200 bg-white'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <Clock className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            Seat {seatNumber} held
          </p>
          <p className={`mt-0.5 text-xs ${isUrgent ? 'text-amber-800' : 'text-slate-600'}`}>
            Complete payment within{' '}
            <span className="font-mono font-bold">{formatCountdown(countdownMs)}</span>
          </p>

          <button
            type="button"
            onClick={onPayNow}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Pay now
          </button>
        </div>
      </div>
    </div>
  );
}
