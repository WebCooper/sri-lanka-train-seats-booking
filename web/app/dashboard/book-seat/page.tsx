'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { ScheduleResultsList } from '../../../components/ScheduleResultsList';
import { CoachSelector } from '../../../components/CoachSelector';
import { SeatMap } from '../../../components/SeatMap';
import { HoldTimerPopup } from '../../../components/HoldTimerPopup';
import { PaymentModal } from '../../../components/PaymentModal';
import { usePassengerAuth } from '../../../context/PassengerAuthContext';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Search,
  Train,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getApiErrorMessage } from '../../../lib/axiosInstance';
import {
  fetchSeatAvailabilityApi,
  fetchStationsApi,
  holdSeatApi,
  quoteFareApi,
  searchSchedulesApi,
} from '../../../lib/passengerApi';
import type {
  BookingTicket,
  FareQuote,
  HoldSeatResponse,
  ScheduleSummary,
  SeatAvailabilityResponse,
  Station,
} from '../../../types/passenger';

const POLL_INTERVAL_MS = 7000;
const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

type SeatLoadState = 'idle' | 'loading' | 'success' | 'error';

interface ActiveHoldState {
  holdId: string;
  coachId: string;
  seatNumber: number;
  coachIdentifier: string;
  expiresAt: string;
  fareQuote: FareQuote;
}

export default function BookSeatPage() {
  const { user } = usePassengerAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [searchResults, setSearchResults] = useState<ScheduleSummary[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleSummary | null>(null);
  const [seatAvailability, setSeatAvailability] = useState<SeatAvailabilityResponse | null>(null);

  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [travelDate, setTravelDate] = useState(todayIsoDate());

  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [pendingSeat, setPendingSeat] = useState<number | null>(null);
  const [lostSeatNumber, setLostSeatNumber] = useState<number | null>(null);
  const [activeHold, setActiveHold] = useState<ActiveHoldState | null>(null);
  const [pendingFareQuote, setPendingFareQuote] = useState<FareQuote | null>(null);
  const [fareQuoteError, setFareQuoteError] = useState<string | null>(null);
  const [isLoadingFareQuote, setIsLoadingFareQuote] = useState(false);

  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [seatLoadState, setSeatLoadState] = useState<SeatLoadState>('idle');
  const [seatLoadError, setSeatLoadError] = useState<string | null>(null);
  const [isRefreshingSeats, setIsRefreshingSeats] = useState(false);
  const [isHoldingSeat, setIsHoldingSeat] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [holdCountdownMs, setHoldCountdownMs] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<{
    hold: ActiveHoldState;
    schedule: ScheduleSummary;
  } | null>(null);

  const seatMapVisible = Boolean(selectedSchedule && originId && destinationId);
  const isMapInteractionDisabled =
    isHoldingSeat || isRefreshingSeats || Boolean(activeHold);

  const sortedStations = useMemo(
    () => [...stations].sort((a, b) => a.name.localeCompare(b.name)),
    [stations],
  );

  const destinationStationOptions = useMemo(
    () => sortedStations.filter((station) => station.id !== originId),
    [originId, sortedStations],
  );

  const stationById = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations],
  );

  const selectedCoach = useMemo(
    () => seatAvailability?.coaches.find((coach) => coach.coach_id === selectedCoachId) ?? null,
    [seatAvailability, selectedCoachId],
  );

  const clearHoldState = useCallback(() => {
    setActiveHold(null);
    setHoldCountdownMs(null);
    setIsPaymentModalOpen(false);
    setPaymentSession(null);
  }, []);

  const clearSeatSelection = useCallback(() => {
    setPendingSeat(null);
    setPendingFareQuote(null);
    setFareQuoteError(null);
    setHoldError(null);
    setLostSeatNumber(null);
  }, []);

  const loadSeatAvailability = useCallback(
    async (
      schedule: ScheduleSummary,
      fromId: string,
      toId: string,
      options?: {
        silent?: boolean;
        preserveCoachId?: string | null;
        preservePendingSeat?: number | null;
      },
    ) => {
      if (!options?.silent) {
        setSeatLoadState('loading');
        setSeatLoadError(null);
        setIsRefreshingSeats(true);
      }

      try {
        const availability = await fetchSeatAvailabilityApi(schedule.schedule_id, {
          origin_id: fromId,
          destination_id: toId,
        });

        setSeatAvailability(availability);
        setSeatLoadState('success');
        setSeatLoadError(null);

        const preferredCoachId =
          options?.preserveCoachId ??
          (availability.coaches.some((c) => c.coach_id === selectedCoachId)
            ? selectedCoachId
            : availability.coaches[0]?.coach_id ?? null);

        setSelectedCoachId(preferredCoachId);

        if (options?.preservePendingSeat) {
          const coach = availability.coaches.find((c) => c.coach_id === preferredCoachId);
          const seatStillAvailable = coach?.seats.some(
            (seat) =>
              seat.seat_number === options.preservePendingSeat && seat.is_available,
          );
          setPendingSeat(seatStillAvailable ? options.preservePendingSeat : null);
          if (!seatStillAvailable) {
            setPendingFareQuote(null);
          }
        }
      } catch (error) {
        setSeatLoadState('error');
        const message = getApiErrorMessage(error, 'Could not load seat availability.');
        setSeatLoadError(message);
        if (!options?.silent) {
          setSeatAvailability(null);
        }
      } finally {
        if (!options?.silent) {
          setIsRefreshingSeats(false);
        }
      }
    },
    [selectedCoachId],
  );

  const refreshSeatMap = useCallback(
    async (silent = true) => {
      if (!selectedSchedule || !originId || !destinationId) {
        return;
      }

      await loadSeatAvailability(selectedSchedule, originId, destinationId, {
        silent,
        preserveCoachId: selectedCoachId,
        preservePendingSeat: pendingSeat,
      });
    },
    [
      destinationId,
      loadSeatAvailability,
      originId,
      pendingSeat,
      selectedCoachId,
      selectedSchedule,
    ],
  );

  const handleSelectSchedule = useCallback(
    async (schedule: ScheduleSummary) => {
      setSelectedSchedule(schedule);
      clearSeatSelection();
      clearHoldState();

      const fromId = originId || schedule.segment.origin_id;
      const toId = destinationId || schedule.segment.destination_id;

      if (!fromId || !toId) {
        setSeatLoadState('idle');
        setSeatAvailability(null);
        setSeatLoadError('Select origin and destination stations before choosing seats.');
        return;
      }

      if (fromId === toId) {
        setSeatLoadState('error');
        setSeatLoadError('Origin and destination must be different.');
        return;
      }

      await loadSeatAvailability(schedule, fromId, toId);
    },
    [clearSeatSelection, destinationId, loadSeatAvailability, originId],
  );

  useEffect(() => {
    const bootstrap = async () => {
      setIsBootstrapping(true);
      setBootstrapError(null);

      try {
        const stationData = await fetchStationsApi();
        setStations(stationData);
      } catch (error) {
        setBootstrapError(getApiErrorMessage(error, 'Could not load booking data.'));
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!pendingSeat || !selectedSchedule || !selectedCoach || !originId || !destinationId) {
      setPendingFareQuote(null);
      setFareQuoteError(null);
      return;
    }

    let cancelled = false;
    setIsLoadingFareQuote(true);
    setFareQuoteError(null);

    quoteFareApi({
      schedule_id: selectedSchedule.schedule_id,
      origin_station_id: originId,
      destination_station_id: destinationId,
      coach_class: selectedCoach.coach_class,
    })
      .then((quote) => {
        if (!cancelled) {
          setPendingFareQuote(quote);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setPendingFareQuote(null);
          setFareQuoteError(getApiErrorMessage(error, 'Could not load fare quote.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFareQuote(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    destinationId,
    originId,
    pendingSeat,
    selectedCoach,
    selectedSchedule,
  ]);

  useEffect(() => {
    if (!seatMapVisible || seatLoadState !== 'success') {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshSeatMap(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refreshSeatMap, seatLoadState, seatMapVisible]);

  useEffect(() => {
    const onFocus = () => {
      if (seatMapVisible) {
        refreshSeatMap(true);
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshSeatMap, seatMapVisible]);

  useEffect(() => {
    if (!activeHold?.expiresAt) {
      setHoldCountdownMs(null);
      return;
    }

    const tick = () => {
      const remaining = new Date(activeHold.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        clearHoldState();
        toast.error('Seat hold expired. Please select and hold a seat again.');
        refreshSeatMap(true);
      } else {
        setHoldCountdownMs(remaining);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeHold, refreshSeatMap]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!originId) {
      setSearchError('Please select an origin station.');
      return;
    }

    if (!destinationId) {
      setSearchError('Please select a destination station.');
      return;
    }

    if (originId === destinationId) {
      setSearchError('Origin and destination must be different.');
      return;
    }

    if (!travelDate) {
      setSearchError('Please select a travel date.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSelectedSchedule(null);
    setSeatAvailability(null);
    setSeatLoadState('idle');
    setSeatLoadError(null);
    clearSeatSelection();
    clearHoldState();

    try {
      const response = await searchSchedulesApi({
        date: travelDate,
        origin_id: originId,
        destination_id: destinationId,
      });

      setSearchResults(response.schedules);
    } catch (error) {
      setSearchResults([]);
      setSearchError(getApiErrorMessage(error, 'Could not search schedules.'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleOriginChange = (nextOriginId: string) => {
    setOriginId(nextOriginId);
    clearSeatSelection();
    clearHoldState();
    setSeatAvailability(null);
    setSeatLoadState('idle');
    setSeatLoadError(null);

    if (nextOriginId && destinationId === nextOriginId) {
      setDestinationId('');
    }
  };

  const handleDestinationChange = (nextDestinationId: string) => {
    setDestinationId(nextDestinationId);
    clearSeatSelection();
    clearHoldState();
    setSeatAvailability(null);
    setSeatLoadState('idle');
    setSeatLoadError(null);
  };

  const handleSelectSeat = (seatNumber: number) => {
    if (isMapInteractionDisabled) {
      return;
    }
    setPendingSeat(seatNumber);
    setLostSeatNumber(null);
    setHoldError(null);
  };

  const handleConfirmHold = async () => {
    if (
      !selectedSchedule ||
      !selectedCoach ||
      !pendingSeat ||
      !originId ||
      !destinationId
    ) {
      return;
    }

    setIsHoldingSeat(true);
    setHoldError(null);

    try {
      await refreshSeatMap(true);

      const coach = seatAvailability?.coaches.find((c) => c.coach_id === selectedCoach.coach_id);
      const seatStillAvailable = coach?.seats.some(
        (seat) => seat.seat_number === pendingSeat && seat.is_available,
      );

      if (!seatStillAvailable) {
        setLostSeatNumber(pendingSeat);
        setPendingSeat(null);
        setPendingFareQuote(null);
        setHoldError('This seat was taken before the hold could start. Pick another seat.');
        await refreshSeatMap(true);
        return;
      }

      const holdResponse: HoldSeatResponse = await holdSeatApi({
        schedule_id: selectedSchedule.schedule_id,
        coach_id: selectedCoach.coach_id,
        seat_number: pendingSeat,
        origin_id: originId,
        destination_id: destinationId,
      });

      const nextHold: ActiveHoldState = {
        holdId: holdResponse.hold_id,
        coachId: holdResponse.coach_id,
        seatNumber: holdResponse.seat_number,
        coachIdentifier: selectedCoach.identifier,
        expiresAt: holdResponse.expires_at,
        fareQuote: holdResponse.fare_quote,
      };

      setActiveHold(nextHold);
      setPaymentSession({
        hold: nextHold,
        schedule: selectedSchedule,
      });
      setPendingSeat(null);
      setPendingFareQuote(null);
      setLostSeatNumber(null);
      setHoldError(null);
      await refreshSeatMap(true);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not hold this seat.');
      setHoldError(message);

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setLostSeatNumber(pendingSeat);
        setPendingSeat(null);
        setPendingFareQuote(null);
        await refreshSeatMap(true);
      }
    } finally {
      setIsHoldingSeat(false);
    }
  };

  const openPaymentModal = () => {
    if (!activeHold || !selectedSchedule) {
      return;
    }

    setPaymentSession({
      hold: activeHold,
      schedule: selectedSchedule,
    });
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentSession(null);
  };

  const handlePaymentSuccess = (ticket: BookingTicket) => {
    toast.success(`Booking confirmed — PNR ${ticket.booking_reference}`);
    setActiveHold(null);
    setHoldCountdownMs(null);
    clearSeatSelection();
    refreshSeatMap(true);
  };

  const originLabel = originId
    ? stationById.get(originId)?.name ?? 'Selected origin'
    : 'Select route';
  const destinationLabel = destinationId
    ? stationById.get(destinationId)?.name ?? 'Selected destination'
    : 'Select route';

  return (
    <PassengerLayout>
      {activeHold && holdCountdownMs !== null && (
        <HoldTimerPopup
          countdownMs={holdCountdownMs}
          seatNumber={activeHold.seatNumber}
          onPayNow={openPaymentModal}
        />
      )}

      {isPaymentModalOpen && paymentSession && user && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          holdId={paymentSession.hold.holdId}
          fareQuote={paymentSession.hold.fareQuote}
          journey={{
            trainName: paymentSession.schedule.train.name,
            trainNumber: paymentSession.schedule.train.train_number,
            lineName: paymentSession.schedule.line.name,
            originName: stationById.get(originId)?.name ?? 'Origin',
            destinationName: stationById.get(destinationId)?.name ?? 'Destination',
            seatNumber: paymentSession.hold.seatNumber,
            coachIdentifier: paymentSession.hold.coachIdentifier,
            departureTime: paymentSession.schedule.departure_time,
          }}
          passengerName={user.name || user.email.split('@')[0]}
          passengerEmail={user.email}
          onClose={closePaymentModal}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div>
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/dashboard" className="font-medium text-indigo-600 hover:underline">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-700">Book a Seat</span>
        </nav>

        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
            Reserve Train Seat
          </h1>
          <p className="text-sm text-slate-500">
            Search scheduled trains and pick a reserved coach seat for your journey segment.
          </p>
        </div>

        {bootstrapError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Could not load booking data</p>
              <p className="mt-1 text-rose-700">{bootstrapError}</p>
            </div>
          </div>
        )}

        <section className="mb-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Search Trains</h2>
              <p className="text-xs text-slate-500">
                Choose your origin, destination, and travel date to find trains with available seats
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Origin Station</label>
              <div className="relative flex items-center">
                <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-indigo-600" />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                  value={originId}
                  onChange={(event) => handleOriginChange(event.target.value)}
                  disabled={isBootstrapping}
                >
                  <option value="">Select origin</option>
                  {sortedStations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Destination Station</label>
              <div className="relative flex items-center">
                <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600" />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                  value={destinationId}
                  onChange={(event) => handleDestinationChange(event.target.value)}
                  disabled={isBootstrapping || !originId}
                >
                  <option value="">
                    {!originId ? 'Select origin first' : 'Select destination'}
                  </option>
                  {destinationStationOptions.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Travel Date</label>
              <div className="relative flex items-center">
                <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  value={travelDate}
                  onChange={(event) => setTravelDate(event.target.value)}
                />
              </div>
            </div>

            {searchError && (
              <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {searchError}
              </div>
            )}

            <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
              <button
                type="submit"
                disabled={isSearching || isBootstrapping || Boolean(bootstrapError)}
                className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px] sm:px-8"
              >
                {isSearching ? 'Searching...' : 'Search Available Trains'}
              </button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <Train className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Search Results</h2>
                <p className="text-xs text-slate-500">
                  Select a train to view reserved coach seats for your journey segment
                </p>
              </div>
            </div>

            <ScheduleResultsList
              schedules={searchResults}
              selectedScheduleId={selectedSchedule?.schedule_id ?? null}
              onSelect={handleSelectSchedule}
              emptyMessage={
                searchError
                  ? 'Search failed. Adjust filters and try again.'
                  : 'Run a search to see matching scheduled trains.'
              }
            />
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Reserved Coach Seats</h2>
                  {selectedSchedule ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedSchedule.train.name} (#{selectedSchedule.train.train_number}) •{' '}
                      {originLabel} → {destinationLabel}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      Select a train from the search results to view seat availability.
                    </p>
                  )}
                </div>

                {seatMapVisible && (
                  <button
                    type="button"
                    onClick={() => refreshSeatMap(false)}
                    disabled={isRefreshingSeats || isHoldingSeat}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isRefreshingSeats ? 'animate-spin' : ''}`}
                    />
                    Refresh map
                  </button>
                )}
              </div>

              {!selectedSchedule && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Choose a scheduled train to load the seat map for your selected leg.
                </div>
              )}

              {selectedSchedule && (!originId || !destinationId) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
                  Select both origin and destination before loading seats.
                </div>
              )}

              {selectedSchedule && originId && destinationId && seatLoadState === 'loading' && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  Loading seat map...
                </div>
              )}

              {selectedSchedule && originId && destinationId && seatLoadState === 'error' && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Could not load seat availability</p>
                      <p className="mt-1">{seatLoadError}</p>
                      <button
                        type="button"
                        onClick={() =>
                          loadSeatAvailability(selectedSchedule, originId, destinationId)
                        }
                        className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedSchedule && originId && destinationId && seatLoadState === 'success' && (
                  <>
                    <div className="mb-5">
                      <CoachSelector
                        coaches={seatAvailability?.coaches ?? []}
                        selectedCoachId={selectedCoachId}
                        onSelect={(coachId) => {
                          setSelectedCoachId(coachId);
                          setPendingSeat(null);
                          setPendingFareQuote(null);
                          setFareQuoteError(null);
                        }}
                        disabled={isMapInteractionDisabled}
                      />
                    </div>

                    <SeatMap
                      coach={selectedCoach}
                      pendingSeat={pendingSeat}
                      activeHold={
                        activeHold
                          ? {
                              seatNumber: activeHold.seatNumber,
                              coachId: activeHold.coachId,
                            }
                          : null
                      }
                      lostSeatNumber={lostSeatNumber}
                      isInteractionDisabled={isMapInteractionDisabled}
                      onSelectSeat={handleSelectSeat}
                    />
                  </>
                )}

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                {pendingSeat && !activeHold && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                    <p className="font-semibold">
                      Seat {pendingSeat} selected on coach {selectedCoach?.identifier ?? '—'}
                    </p>
                    {isLoadingFareQuote && (
                      <p className="mt-2 flex items-center gap-2 text-indigo-800">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading fare quote...
                      </p>
                    )}
                    {fareQuoteError && (
                      <p className="mt-2 text-rose-700">{fareQuoteError}</p>
                    )}
                    {pendingFareQuote && !isLoadingFareQuote && (
                      <p className="mt-2 text-indigo-800">
                        Estimated fare: {pendingFareQuote.currency}{' '}
                        {pendingFareQuote.fare_amount.toFixed(2)} ({pendingFareQuote.distance_km} km,{' '}
                        {pendingFareQuote.time_band})
                      </p>
                    )}
                    <p className="mt-2 text-xs text-indigo-700">
                      Confirm below to start the 10-minute hold timer.
                    </p>
                  </div>
                )}

                {holdError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {holdError}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Selection status</span>
                    <div className="text-sm font-bold text-slate-900">
                      {activeHold
                        ? `Holding seat ${activeHold.seatNumber}`
                        : pendingSeat && selectedCoach
                          ? `Seat ${pendingSeat} selected — confirm to hold`
                          : 'No seat selected'}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Seat map refreshes every 7s in the background while visible.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmHold}
                    disabled={
                      !pendingSeat ||
                      !selectedCoach ||
                      isHoldingSeat ||
                      isRefreshingSeats ||
                      Boolean(activeHold) ||
                      isLoadingFareQuote
                    }
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                  >
                    {isHoldingSeat ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Holding seat...
                      </span>
                    ) : (
                      'Confirm & hold seat'
                    )}
                  </button>

                  {activeHold && (
                    <button
                      type="button"
                      onClick={openPaymentModal}
                      className="rounded-xl border border-indigo-200 bg-white px-6 py-3 text-xs font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50"
                    >
                      Pay now
                    </button>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}
