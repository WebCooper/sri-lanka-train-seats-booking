'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PassengerLayout } from '../../../components/PassengerLayout';
import { ScheduleResultsList } from '../../../components/ScheduleResultsList';
import { CoachSelector } from '../../../components/CoachSelector';
import { SeatMap } from '../../../components/SeatMap';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Search,
  Train,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../../lib/axiosInstance';
import {
  fetchLinesApi,
  fetchSeatAvailabilityApi,
  fetchStationsApi,
  fetchTrainsApi,
  searchSchedulesApi,
} from '../../../lib/passengerApi';
import type {
  Line,
  ScheduleSummary,
  SeatAvailabilityResponse,
  Station,
  Train as TrainType,
} from '../../../types/passenger';

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export default function BookSeatPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [searchResults, setSearchResults] = useState<ScheduleSummary[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleSummary | null>(null);
  const [seatAvailability, setSeatAvailability] = useState<SeatAvailabilityResponse | null>(null);

  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [dateFrom, setDateFrom] = useState(todayIsoDate());
  const [dateTo, setDateTo] = useState(todayIsoDate());
  const [lineId, setLineId] = useState('');
  const [trainId, setTrainId] = useState('');

  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  const stationById = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations],
  );

  const selectedCoach = useMemo(
    () =>
      seatAvailability?.coaches.find((coach) => coach.coach_id === selectedCoachId) ?? null,
    [seatAvailability, selectedCoachId],
  );

  const loadSeatAvailability = useCallback(
    async (schedule: ScheduleSummary, fromId: string, toId: string) => {
      setIsLoadingSeats(true);
      setSeatAvailability(null);
      setSelectedCoachId(null);
      setSelectedSeat(null);

      try {
        const availability = await fetchSeatAvailabilityApi(schedule.schedule_id, {
          origin_id: fromId,
          destination_id: toId,
        });

        setSeatAvailability(availability);

        if (availability.coaches.length > 0) {
          setSelectedCoachId(availability.coaches[0].coach_id);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Could not load seat availability.'));
      } finally {
        setIsLoadingSeats(false);
      }
    },
    [],
  );

  const handleSelectSchedule = useCallback(
    async (schedule: ScheduleSummary) => {
      setSelectedSchedule(schedule);

      const fromId = originId || schedule.segment.origin_id;
      const toId = destinationId || schedule.segment.destination_id;

      if (!fromId || !toId) {
        toast.error('Select origin and destination stations before choosing seats.');
        return;
      }

      if (fromId === toId) {
        toast.error('Origin and destination must be different.');
        return;
      }

      await loadSeatAvailability(schedule, fromId, toId);
    },
    [destinationId, loadSeatAvailability, originId],
  );

  useEffect(() => {
    const bootstrap = async () => {
      setIsBootstrapping(true);

      try {
        const [stationData, lineData, trainData] = await Promise.all([
          fetchStationsApi(),
          fetchLinesApi(),
          fetchTrainsApi(),
        ]);

        setStations(stationData);
        setLines(lineData);
        setTrains(trainData);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Could not load booking data.'));
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const loadFilteredTrains = async () => {
      try {
        const trainData = await fetchTrainsApi({
          line_id: lineId || undefined,
        });
        setTrains(trainData);
      } catch {
        // Keep existing train list if filter refresh fails.
      }
    };

    if (!isBootstrapping) {
      loadFilteredTrains();
    }
  }, [isBootstrapping, lineId]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (originId && destinationId && originId === destinationId) {
      toast.error('Origin and destination must be different.');
      return;
    }

    if (originId && !destinationId) {
      toast.error('Please select a destination station.');
      return;
    }

    if (!originId && destinationId) {
      toast.error('Please select an origin station.');
      return;
    }

    setIsSearching(true);
    setSelectedSchedule(null);
    setSeatAvailability(null);
    setSelectedCoachId(null);
    setSelectedSeat(null);

    try {
      const response = await searchSchedulesApi({
        date_from: dateFrom,
        date_to: dateTo,
        origin_id: originId || undefined,
        destination_id: destinationId || undefined,
        line_id: lineId || undefined,
        train_id: trainId || undefined,
      });

      setSearchResults(response.schedules);

      if (response.schedules.length === 0) {
        toast.error('No trains found for the selected filters.');
      } else {
        toast.success(`Found ${response.schedules.length} scheduled train(s).`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not search schedules.'));
    } finally {
      setIsSearching(false);
    }
  };

  const originLabel = originId
    ? stationById.get(originId)?.name ?? 'Selected origin'
    : 'Full line or selected route';
  const destinationLabel = destinationId
    ? stationById.get(destinationId)?.name ?? 'Selected destination'
    : 'Full line or selected route';

  return (
    <PassengerLayout>
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

        <section className="mb-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Search Trains</h2>
              <p className="text-xs text-slate-500">Filter by line, train, date, and route</p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Line</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                value={lineId}
                onChange={(event) => {
                  setLineId(event.target.value);
                  setTrainId('');
                }}
              >
                <option value="">All lines</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Train</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                value={trainId}
                onChange={(event) => setTrainId(event.target.value)}
              >
                <option value="">All trains</option>
                {trains.map((train) => (
                  <option key={train.id} value={train.id}>
                    {train.name} (#{train.train_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Date From</label>
              <div className="relative flex items-center">
                <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Date To</label>
              <div className="relative flex items-center">
                <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Origin Station</label>
              <div className="relative flex items-center">
                <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-indigo-600" />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  value={originId}
                  onChange={(event) => setOriginId(event.target.value)}
                >
                  <option value="">Any origin (full line availability)</option>
                  {stations.map((station) => (
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  value={destinationId}
                  onChange={(event) => setDestinationId(event.target.value)}
                >
                  <option value="">Any destination (full line availability)</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
              <button
                type="submit"
                disabled={isSearching || isBootstrapping}
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
              emptyMessage="Run a search to see matching scheduled trains."
            />
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
              <div className="mb-6 border-b border-slate-100 pb-4">
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

              {isLoadingSeats ? (
                <p className="text-sm text-slate-500">Loading seat map...</p>
              ) : (
                <>
                  <div className="mb-5">
                    <CoachSelector
                      coaches={seatAvailability?.coaches ?? []}
                      selectedCoachId={selectedCoachId}
                      onSelect={(coachId) => {
                        setSelectedCoachId(coachId);
                        setSelectedSeat(null);
                      }}
                    />
                  </div>

                  <SeatMap
                    coach={selectedCoach}
                    selectedSeat={selectedSeat}
                    onSelectSeat={setSelectedSeat}
                  />
                </>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div>
                  <span className="text-xs text-slate-500">Selected seat</span>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedSeat && selectedCoach
                      ? `Coach ${selectedCoach.identifier} (${selectedCoach.coach_class}) • Seat ${selectedSeat}`
                      : 'None selected'}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Partial journeys reuse seats on non-overlapping segments.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!selectedSeat || !selectedCoach}
                  className="cursor-not-allowed rounded-xl bg-slate-200 px-6 py-3 text-xs font-semibold text-slate-500"
                  title="Booking confirmation API is not wired yet"
                >
                  Seat Selected (Booking API pending)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}
