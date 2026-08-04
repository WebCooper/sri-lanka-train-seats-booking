import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, Route, Train, Loader2, CheckCircle2 } from 'lucide-react';
import type { RailwayLine, TrainConfig } from '../api/trainManagementApi';
import type {
  ScheduleItem,
  CreateSchedulePayload,
  BulkCreateSchedulePayload,
  UpdateSchedulePayload,
} from '../api/scheduleManagementApi';
import toast from 'react-hot-toast';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

type CreateMode = 'single' | 'recurring';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (payload: CreateSchedulePayload) => Promise<void>;
  onSaveBulkCreate: (payload: BulkCreateSchedulePayload) => Promise<void>;
  onSaveUpdate: (id: string, payload: UpdateSchedulePayload) => Promise<void>;
  lines: RailwayLine[];
  trains: TrainConfig[];
  initialData?: ScheduleItem | null;
}

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatForInput = (isoStr?: string): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const generateRecurringSessions = (
  startDate: string,
  endDate: string,
  departureTime: string,
  arrivalTime: string,
  daysOfWeek: number[],
): Array<{ departure_time: string; arrival_time: string }> => {
  if (!startDate || !endDate || !departureTime || !arrivalTime || daysOfWeek.length === 0) {
    return [];
  }

  const sessions: Array<{ departure_time: string; arrival_time: string }> = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const [depHour, depMinute] = departureTime.split(':').map(Number);
  const [arrHour, arrMinute] = arrivalTime.split(':').map(Number);

  for (const current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    if (!daysOfWeek.includes(current.getDay())) continue;

    const dep = new Date(current);
    dep.setHours(depHour, depMinute, 0, 0);

    const arr = new Date(current);
    arr.setHours(arrHour, arrMinute, 0, 0);

    if (arr <= dep) {
      arr.setDate(arr.getDate() + 1);
    }

    sessions.push({
      departure_time: dep.toISOString(),
      arrival_time: arr.toISOString(),
    });
  }

  return sessions;
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSaveCreate,
  onSaveBulkCreate,
  onSaveUpdate,
  lines,
  trains,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [createMode, setCreateMode] = useState<CreateMode>('recurring');
  const [lineId, setLineId] = useState('');
  const [trainId, setTrainId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurringDepartureTime, setRecurringDepartureTime] = useState('06:00');
  const [recurringArrivalTime, setRecurringArrivalTime] = useState('14:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(WEEKDAYS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLineId(initialData.line?.id || lines[0]?.id || '');
      setTrainId(initialData.train?.id || trains[0]?.id || '');
      setDepartureTime(formatForInput(initialData.departure_time));
      setArrivalTime(formatForInput(initialData.arrival_time));
    } else {
      setCreateMode('recurring');
      setLineId(lines[0]?.id || '');
      setTrainId(trains[0]?.id || '');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      const end = new Date(tomorrow);
      end.setDate(end.getDate() + 29);

      const arrival = new Date(tomorrow);
      arrival.setHours(14, 0, 0, 0);

      setStartDate(formatDateInput(tomorrow));
      setEndDate(formatDateInput(end));
      setRecurringDepartureTime('06:00');
      setRecurringArrivalTime('14:00');
      setDaysOfWeek(WEEKDAYS);
      setDepartureTime(formatForInput(tomorrow.toISOString()));
      setArrivalTime(formatForInput(arrival.toISOString()));
    }
  }, [initialData, isOpen, lines, trains]);

  const recurringSessions = useMemo(
    () =>
      generateRecurringSessions(
        startDate,
        endDate,
        recurringDepartureTime,
        recurringArrivalTime,
        daysOfWeek,
      ),
    [startDate, endDate, recurringDepartureTime, recurringArrivalTime, daysOfWeek],
  );

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day).sort() : [...prev, day].sort(),
    );
  };

  const getDurationPreview = (depValue: string, arrValue: string): string => {
    if (!depValue || !arrValue) return '--';

    let dep: number;
    let arr: number;

    if (createMode === 'recurring' && !isEditMode) {
      const [depHour, depMinute] = recurringDepartureTime.split(':').map(Number);
      const [arrHour, arrMinute] = recurringArrivalTime.split(':').map(Number);
      dep = depHour * 60 + depMinute;
      arr = arrHour * 60 + arrMinute;
      if (arr <= dep) arr += 24 * 60;
      const diffMins = arr - dep;
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hrs} hr${hrs !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
    }

    dep = new Date(depValue).getTime();
    arr = new Date(arrValue).getTime();
    if (isNaN(dep) || isNaN(arr) || arr <= dep) {
      return 'Invalid (Arrival must be after departure)';
    }

    const diffMins = Math.round((arr - dep) / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs} hr${hrs !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lineId) {
      toast.error('Please select a railway line.');
      return;
    }

    if (!trainId) {
      toast.error('Please select a train.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        if (!departureTime || !arrivalTime) {
          toast.error('Please specify both departure and arrival times.');
          return;
        }

        const depDate = new Date(departureTime);
        const arrDate = new Date(arrivalTime);

        if (depDate >= arrDate) {
          toast.error('Arrival time must be strictly after departure time.');
          return;
        }

        await onSaveUpdate(initialData.id, {
          line_id: lineId,
          train_id: trainId,
          departure_time: depDate.toISOString(),
          arrival_time: arrDate.toISOString(),
        });
        toast.success('Train schedule updated successfully.');
      } else if (createMode === 'recurring') {
        if (!startDate || !endDate) {
          toast.error('Please select a start and end date.');
          return;
        }

        if (daysOfWeek.length === 0) {
          toast.error('Please select at least one day of the week.');
          return;
        }

        if (recurringSessions.length === 0) {
          toast.error('No sessions match the selected date range and days.');
          return;
        }

        await onSaveBulkCreate({
          line_id: lineId,
          train_id: trainId,
          sessions: recurringSessions,
        });
      } else {
        if (!departureTime || !arrivalTime) {
          toast.error('Please specify both departure and arrival times.');
          return;
        }

        const depDate = new Date(departureTime);
        const arrDate = new Date(arrivalTime);

        if (depDate >= arrDate) {
          toast.error('Arrival time must be strictly after departure time.');
          return;
        }

        await onSaveCreate({
          line_id: lineId,
          train_id: trainId,
          departure_time: depDate.toISOString(),
          arrival_time: arrDate.toISOString(),
        });
        toast.success('New train session scheduled successfully.');
      }
      onClose();
    } catch {
      // Handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Train Schedule Session' : 'Schedule New Train Session'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? 'Update departure, arrival, line, or assigned train for this session.'
                  : 'Assign a train to a line route and schedule one or many departure sessions.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-5">
          {!isEditMode && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCreateMode('recurring')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  createMode === 'recurring'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Recurring schedule
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('single')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  createMode === 'single'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Single session
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assigned Line Route *</span>
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              required
            >
              <option value="">-- Select Railway Line --</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.start_station?.code} &rarr; {l.end_station?.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-sky-600" />
              <span>Assigned Train Fleet *</span>
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
              value={trainId}
              onChange={(e) => setTrainId(e.target.value)}
              required
            >
              <option value="">-- Select Train --</option>
              {trains.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (#{t.train_number}) - {t.coach_count || 0} Coaches ({t.total_seat_count || 0} Seats)
                </option>
              ))}
            </select>
          </div>

          {!isEditMode && createMode === 'recurring' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Start date *</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>End date *</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Departure time *</span>
                  </label>
                  <input
                    type="time"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={recurringDepartureTime}
                    onChange={(e) => setRecurringDepartureTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Arrival time *</span>
                  </label>
                  <input
                    type="time"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={recurringArrivalTime}
                    onChange={(e) => setRecurringArrivalTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-700">Days of week *</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDaysOfWeek(ALL_DAYS)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Every day
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysOfWeek(WEEKDAYS)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysOfWeek(WEEKENDS)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Weekends
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, day) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        daysOfWeek.includes(day)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-800">
                <span className="font-semibold">{recurringSessions.length}</span> session
                {recurringSessions.length !== 1 ? 's' : ''} will be scheduled on the selected days
                between {startDate || '—'} and {endDate || '—'}.
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Departure Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Arrival Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Estimated Trip Duration:</span>
            <span className="text-indigo-600 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
              {getDurationPreview(departureTime, arrivalTime)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isEditMode
                      ? 'Save Schedule Changes'
                      : createMode === 'recurring'
                        ? `Schedule ${recurringSessions.length} Session${recurringSessions.length !== 1 ? 's' : ''}`
                        : 'Confirm Schedule Session'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
