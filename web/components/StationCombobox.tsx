'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Station } from '../types/passenger';

interface StationComboboxProps {
  stations: Station[];
  value: string;
  onChange: (stationId: string) => void;
  placeholder: string;
  disabled?: boolean;
  excludeStationId?: string;
  iconClassName?: string;
}

function stationLabel(station: Station): string {
  return `${station.name} (${station.code})`;
}

function matchesStation(station: Station, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    station.name.toLowerCase().includes(normalized) ||
    station.code.toLowerCase().includes(normalized)
  );
}

export function StationCombobox({
  stations,
  value,
  onChange,
  placeholder,
  disabled = false,
  excludeStationId,
  iconClassName = 'text-indigo-600',
}: StationComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === value) ?? null,
    [stations, value],
  );

  const filteredStations = useMemo(
    () =>
      stations
        .filter((station) => station.id !== excludeStationId)
        .filter((station) => matchesStation(station, query)),
    [excludeStationId, query, stations],
  );

  useEffect(() => {
    if (selectedStation) {
      setQuery(stationLabel(selectedStation));
    } else if (!isOpen) {
      setQuery('');
    }
  }, [isOpen, selectedStation]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selectStation = (station: Station) => {
    onChange(station.id);
    setQuery(stationLabel(station));
    setIsOpen(false);
  };

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setIsOpen(true);

    if (selectedStation && stationLabel(selectedStation) !== nextQuery) {
      onChange('');
    }
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsOpen(false);

      if (selectedStation) {
        setQuery(stationLabel(selectedStation));
        return;
      }

      setQuery('');
    }, 120);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) =>
        filteredStations.length === 0 ? 0 : (index + 1) % filteredStations.length,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) =>
        filteredStations.length === 0
          ? 0
          : (index - 1 + filteredStations.length) % filteredStations.length,
      );
      return;
    }

    if (event.key === 'Enter' && isOpen && filteredStations[highlightedIndex]) {
      event.preventDefault();
      selectStation(filteredStations[highlightedIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      if (selectedStation) {
        setQuery(stationLabel(selectedStation));
      } else {
        setQuery('');
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <MapPin
        className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${iconClassName}`}
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={query}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      />

      {isOpen && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          {filteredStations.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-slate-500">No matching stations</li>
          ) : (
            filteredStations.map((station, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = station.id === value;

              return (
                <li key={station.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectStation(station)}
                    className={`flex w-full flex-col px-3.5 py-2.5 text-left text-sm transition ${
                      isHighlighted ? 'bg-indigo-50 text-indigo-900' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{station.name}</span>
                    <span className="text-xs text-slate-500">{station.code}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
