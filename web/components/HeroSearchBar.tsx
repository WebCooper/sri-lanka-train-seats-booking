'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2, Search } from 'lucide-react';
import { StationCombobox } from './StationCombobox';
import { usePassengerAuth } from '../context/PassengerAuthContext';
import { fetchStationsApi } from '../lib/passengerApi';
import type { Station } from '../types/passenger';

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const HERO_SEARCH_KEY = 'heroSearch';

export function HeroSearchBar() {
  const router = useRouter();
  const { user } = usePassengerAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [travelDate, setTravelDate] = useState(todayIsoDate());
  const [searchError, setSearchError] = useState<string | null>(null);

  const sortedStations = useMemo(
    () => [...stations].sort((a, b) => a.name.localeCompare(b.name)),
    [stations],
  );

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchStationsApi();
        setStations(data);
      } catch {
        // Search bar still renders with empty station list
      } finally {
        setIsLoadingStations(false);
      }
    };

    loadStations();
  }, []);

  const handleOriginChange = (nextOriginId: string) => {
    setOriginId(nextOriginId);
    setSearchError(null);
    if (nextOriginId && destinationId === nextOriginId) {
      setDestinationId('');
    }
  };

  const handleDestinationChange = (nextDestinationId: string) => {
    setDestinationId(nextDestinationId);
    setSearchError(null);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchError(null);

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

    sessionStorage.setItem(
      HERO_SEARCH_KEY,
      JSON.stringify({ originId, destinationId, travelDate }),
    );

    if (user) {
      router.push('/dashboard/book-seat');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl border border-white/90 bg-white/80 p-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:rounded-3xl sm:p-4 lg:p-5">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-end lg:gap-4">
            <div className="grid flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="text-[10px] font-semibold text-black sm:text-xs">From</label>
                <StationCombobox
                  stations={sortedStations}
                  value={originId}
                  onChange={handleOriginChange}
                  placeholder="Origin station"
                  disabled={isLoadingStations}
                  variant="on-glass"
                  iconClassName="text-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="text-[10px] font-semibold text-black sm:text-xs">To</label>
                <StationCombobox
                  stations={sortedStations}
                  value={destinationId}
                  onChange={handleDestinationChange}
                  placeholder={originId ? 'Destination station' : 'Select origin first'}
                  disabled={isLoadingStations || !originId}
                  excludeStationId={originId}
                  variant="on-glass"
                  iconClassName="text-emerald-600"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1 lg:col-span-1">
                <label className="text-[10px] font-semibold text-black sm:text-xs">Travel date</label>
                <div className="relative flex items-center">
                  <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-black/60 sm:left-3.5" />
                  <input
                    type="date"
                    className="w-full rounded-xl border border-white/90 bg-white/80 py-2 pl-10 pr-3 text-sm text-black outline-none backdrop-blur-xl transition-all focus:border-indigo-500 focus:bg-white/90 focus:ring-4 focus:ring-indigo-500/10 sm:py-2.5 sm:pl-11 sm:pr-4"
                    value={travelDate}
                    min={todayIsoDate()}
                    onChange={(event) => {
                      setTravelDate(event.target.value);
                      setSearchError(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingStations}
              className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-900/40 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[200px]"
            >
              {isLoadingStations ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search Trains</span>
                </>
              )}
            </button>
          </div>

          {searchError && (
            <div className="mt-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-2.5 text-xs text-rose-800 backdrop-blur-sm">
              {searchError}
            </div>
          )}

          {!user && !searchError && (
            <p className="mt-2 hidden text-center text-[10px] text-black sm:block sm:text-[11px] lg:text-left">
              Sign in required to complete a booking after search
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export const HERO_SEARCH_STORAGE_KEY = HERO_SEARCH_KEY;
