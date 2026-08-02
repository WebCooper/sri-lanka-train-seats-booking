'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';
import { confirmBookingApi, quoteFareApi } from '../lib/passengerApi';
import { getApiErrorMessage } from '../lib/axiosInstance';
import {
  formatCardNumber,
  formatExpiry,
  MOCK_PAYMENT_CARDS,
  processMockPayment,
  validatePaymentForm,
} from '../lib/mockPayment';
import type { BookingTicket, FareQuote } from '../types/passenger';

interface PaymentJourneySummary {
  trainName: string;
  trainNumber: string;
  lineName: string;
  originName: string;
  destinationName: string;
  seatNumber: number;
  coachIdentifier: string;
  departureTime: string;
}

interface FareQuoteParams {
  schedule_id: string;
  origin_station_id: string;
  destination_station_id: string;
  coach_class: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  holdId: string;
  quoteParams: FareQuoteParams;
  journey: PaymentJourneySummary;
  passengerName: string;
  passengerEmail: string;
  onClose: () => void;
  onSuccess: (ticket: BookingTicket) => void;
}

function coachClassLabel(coachClass: string): string {
  return coachClass
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function timeBandLabel(timeBand: FareQuote['time_band']): string {
  return timeBand === 'peak' ? 'Peak' : 'Off-peak';
}

export function PaymentModal({
  isOpen,
  holdId,
  quoteParams,
  journey,
  passengerName,
  passengerEmail,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<BookingTicket | null>(null);
  const [fareQuote, setFareQuote] = useState<FareQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCardName(passengerName);
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setFormError(null);
    setIsProcessing(false);
    setConfirmedTicket(null);
    setFareQuote(null);
    setQuoteError(null);

    let cancelled = false;
    setIsLoadingQuote(true);

    quoteFareApi(quoteParams)
      .then((quote) => {
        if (!cancelled) {
          setFareQuote(quote);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setQuoteError(getApiErrorMessage(error, 'Could not load fare breakdown.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingQuote(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    passengerName,
    quoteParams.schedule_id,
    quoteParams.origin_station_id,
    quoteParams.destination_station_id,
    quoteParams.coach_class,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validatePaymentForm({
      cardName,
      cardNumber,
      expiry,
      cvc,
    });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!fareQuote) {
      setFormError('Fare breakdown is not ready yet. Please wait or close and try again.');
      return;
    }

    setIsProcessing(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const paymentResult = processMockPayment(cardNumber);

    if (paymentResult === 'declined') {
      setIsProcessing(false);
      setFormError('Payment was declined. Your seat hold is still active — try another card.');
      return;
    }

    if (paymentResult === 'invalid') {
      setIsProcessing(false);
      setFormError('This mock checkout only accepts the demo success or decline cards shown below.');
      return;
    }

    try {
      const ticket = await confirmBookingApi({
        hold_id: holdId,
        passenger_details: {
          name: cardName.trim(),
          email: passengerEmail,
        },
      });

      setConfirmedTicket(ticket);
      onSuccess(ticket);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Booking confirmation failed after payment.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close payment modal"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={() => {
          if (!isProcessing) {
            onClose();
          }
        }}
      />

      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="payment-modal-title" className="text-lg font-bold text-slate-900">
              {confirmedTicket ? 'Booking confirmed' : 'Complete payment'}
            </h2>
            <p className="text-xs text-slate-500">
              {confirmedTicket
                ? 'Your e-ticket has been generated.'
                : 'Secure mock checkout for your reserved seat.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmedTicket ? (
          <div className="space-y-4 px-6 py-8">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Payment successful</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Booking reference{' '}
                  <span className="font-mono font-bold">{confirmedTicket.booking_reference}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p>
                {journey.trainName} (#{journey.trainNumber}) • Seat {journey.seatNumber} • Coach{' '}
                {journey.coachIdentifier}
              </p>
              <p className="mt-1">
                {journey.originName} → {journey.destinationName}
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Total paid: LKR {confirmedTicket.fare_amount.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-6 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-bold text-slate-900">Pricing breakdown</h3>
              <p className="mt-1 text-xs text-slate-500">
                {journey.trainName} (#{journey.trainNumber}) on {journey.lineName}
              </p>

              {isLoadingQuote && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  Loading fare breakdown...
                </div>
              )}

              {quoteError && !isLoadingQuote && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                  {quoteError}
                </div>
              )}

              {fareQuote && !isLoadingQuote && (
              <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Flat booking fee</span>
                  <span>
                    {fareQuote.currency} {fareQuote.flat_booking_fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>
                    Distance ({fareQuote.distance_km} km)
                  </span>
                  <span>
                    {fareQuote.currency} {fareQuote.distance_charge.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Base subtotal</span>
                  <span>
                    {fareQuote.currency} {fareQuote.base_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>
                    {coachClassLabel(fareQuote.coach_class)} ({fareQuote.coach_class_multiplier}x)
                  </span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>
                    {timeBandLabel(fareQuote.time_band)} ({fareQuote.time_multiplier}x)
                  </span>
                  <span>Included</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between gap-4 text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>
                      {fareQuote.currency} {fareQuote.fare_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              )}

              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-900">
                <p className="font-semibold">
                  Seat {journey.seatNumber} • Coach {journey.coachIdentifier}
                </p>
                <p className="mt-1">
                  {journey.originName} → {journey.destinationName}
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Card details
              </div>

              <div className="mb-4 space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Demo cards</p>
                <p>
                  <span className="font-mono text-slate-800">{MOCK_PAYMENT_CARDS.success.display}</span>{' '}
                  — {MOCK_PAYMENT_CARDS.success.description}
                </p>
                <p>
                  <span className="font-mono text-slate-800">{MOCK_PAYMENT_CARDS.decline.display}</span>{' '}
                  — {MOCK_PAYMENT_CARDS.decline.description}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Name on card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    placeholder="Sahan Perera"
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Card number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-indigo-600"
                    placeholder="4111 1111 1111 1111"
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Expiry</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-indigo-600"
                      placeholder="MM/YY"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">CVC</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={cvc}
                      onChange={(event) =>
                        setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-indigo-600"
                      placeholder="123"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || isLoadingQuote || !fareQuote}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing payment...
                    </>
                  ) : isLoadingQuote || !fareQuote ? (
                    'Loading price...'
                  ) : (
                    <>
                      Pay {fareQuote.currency} {fareQuote.fare_amount.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
