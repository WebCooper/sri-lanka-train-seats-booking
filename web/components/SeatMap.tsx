'use client';

import React from 'react';
import type { SeatAvailabilityCoach, SeatAvailabilitySeat, SeatVisualState } from '../types/passenger';
import {
  buildSeatRows,
  COACH_CLASS_LABELS,
  splitRowSeats,
} from '../lib/coachLayout';
import { ArrowRight } from 'lucide-react';

interface SeatMapProps {
  coach: SeatAvailabilityCoach | null;
  pendingSeat: number | null;
  activeHold: { seatNumber: number; coachId: string } | null;
  lostSeatNumber: number | null;
  isInteractionDisabled: boolean;
  onSelectSeat: (seatNumber: number) => void;
}

function coachClassLabel(coachClass: string): string {
  return COACH_CLASS_LABELS[coachClass] ?? coachClass;
}

function seatLookup(seats: SeatAvailabilitySeat[]): Map<number, SeatAvailabilitySeat> {
  return new Map(seats.map((seat) => [seat.seat_number, seat]));
}

function resolveSeatVisualState(
  seat: SeatAvailabilitySeat,
  coachId: string,
  pendingSeat: number | null,
  activeHold: { seatNumber: number; coachId: string } | null,
  lostSeatNumber: number | null,
): SeatVisualState {
  if (lostSeatNumber === seat.seat_number) {
    return 'lost';
  }

  if (activeHold?.coachId === coachId && activeHold.seatNumber === seat.seat_number) {
    return 'holding';
  }

  if (pendingSeat === seat.seat_number) {
    return 'selected';
  }

  if (seat.is_available) {
    return 'available';
  }

  return 'occupied';
}

const SEAT_STATE_STYLES: Record<SeatVisualState, string> = {
  available:
    'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50',
  selected:
    'cursor-pointer border-indigo-500 bg-indigo-100 text-indigo-800 ring-2 ring-indigo-400/40',
  holding:
    'cursor-default border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25',
  lost:
    'cursor-not-allowed border-rose-400 bg-rose-100 text-rose-700 ring-2 ring-rose-300/60',
  occupied: 'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500',
};

const SEAT_STATE_LABELS: Record<SeatVisualState, string> = {
  available: 'Available',
  selected: 'Selected — confirm to hold',
  holding: 'Your hold',
  lost: 'Lost — someone else took it',
  occupied: 'Unavailable for this leg',
};

function SeatButton({
  seat,
  visualState,
  isInteractionDisabled,
  onSelect,
}: {
  seat: SeatAvailabilitySeat;
  visualState: SeatVisualState;
  isInteractionDisabled: boolean;
  onSelect: (seatNumber: number) => void;
}) {
  const isClickable = visualState === 'available' && !isInteractionDisabled;

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onSelect(seat.seat_number)}
      title={`Seat ${seat.seat_number}: ${SEAT_STATE_LABELS[visualState]}`}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold transition-all sm:h-11 sm:w-11 sm:text-xs ${SEAT_STATE_STYLES[visualState]}`}
    >
      {seat.seat_number}
    </button>
  );
}

export function SeatMap({
  coach,
  pendingSeat,
  activeHold,
  lostSeatNumber,
  isInteractionDisabled,
  onSelectSeat,
}: SeatMapProps) {
  if (!coach) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Select a reserved coach to view seats.
      </div>
    );
  }

  const seatConfiguration = coach.seat_configuration || '2+2';
  const rows = buildSeatRows(coach.seat_count, seatConfiguration);
  const seatsByNumber = seatLookup(coach.seats);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Coach {coach.identifier}</h4>
          <p className="mt-1 text-xs text-slate-500">
            {coachClassLabel(coach.coach_class)} • {seatConfiguration} seating •{' '}
            {coach.available_seats_count} of {coach.seat_count} available
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-slate-200 bg-white" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-indigo-500 bg-indigo-100" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-emerald-600 bg-emerald-600" />
            Your hold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-slate-200" />
            Held / booked overlap
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-rose-400 bg-rose-100" />
            Lost seat
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 px-2 py-1 sm:px-3">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-1.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span>Back</span>
            <div className="flex min-w-[120px] max-w-xs flex-1 items-center gap-2 sm:min-w-[180px]">
              <div className="h-px flex-1 bg-slate-300" />
              <span className="shrink-0 normal-case tracking-normal text-slate-500">
                Direction of travel
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            <span className="text-indigo-500">Front</span>
          </div>

          <div className="flex justify-center overflow-visible">
            <div className="inline-flex items-center justify-center">
              <div className="origin-center rotate-90">
                <div className="rounded-xl border-2 border-slate-300/80 bg-white px-2 py-1 shadow-inner sm:px-3 sm:py-1">
                  <div className="space-y-2">
                    {rows.map((rowSeats, rowIndex) => {
                      const sections = splitRowSeats(rowSeats, seatConfiguration);

                      return (
                        <div
                          key={`row-${rowIndex}`}
                          className="flex items-center justify-center gap-2 sm:gap-3"
                        >
                          {sections.map((sectionSeats, sectionIndex) => (
                            <React.Fragment key={`section-${rowIndex}-${sectionIndex}`}>
                              {sectionIndex > 0 && (
                                <div
                                  className="mx-0.5 flex h-11 w-6 shrink-0 flex-col items-center justify-center sm:w-7"
                                  aria-hidden="true"
                                >
                                  <div className="h-full w-px bg-slate-200" />
                                  <span className="-rotate-90 my-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-slate-300">
                                    Aisle
                                  </span>
                                  <div className="h-full w-px bg-slate-200" />
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 sm:gap-2">
                                {sectionSeats.map((seatNumber) => {
                                  const seat = seatsByNumber.get(seatNumber);
                                  if (!seat) {
                                    return null;
                                  }

                                  const visualState = resolveSeatVisualState(
                                    seat,
                                    coach.coach_id,
                                    pendingSeat,
                                    activeHold,
                                    lostSeatNumber,
                                  );

                                  return (
                                    <div key={seat.seat_number} className="-rotate-90">
                                      <SeatButton
                                        seat={seat}
                                        visualState={visualState}
                                        isInteractionDisabled={isInteractionDisabled}
                                        onSelect={onSelectSeat}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-1 text-center text-[10px] text-slate-400">
            Coach shown lengthwise — front on the right ({seatConfiguration} per row).
          </p>
        </div>
      </div>
    </div>
  );
}
