import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Route, Train, Loader2, CheckCircle2 } from 'lucide-react';
import type { RailwayLine, TrainConfig } from '../api/trainManagementApi';
import type { 
  ScheduleItem, 
  CreateSchedulePayload, 
  UpdateSchedulePayload 
} from '../api/scheduleManagementApi';
import toast from 'react-hot-toast';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (payload: CreateSchedulePayload) => Promise<void>;
  onSaveUpdate: (id: string, payload: UpdateSchedulePayload) => Promise<void>;
  lines: RailwayLine[];
  trains: TrainConfig[];
  initialData?: ScheduleItem | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  lines,
  trains,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [lineId, setLineId] = useState('');
  const [trainId, setTrainId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoStr?: string): string => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setLineId(initialData.line?.id || (lines[0]?.id || ''));
      setTrainId(initialData.train?.id || (trains[0]?.id || ''));
      setDepartureTime(formatForInput(initialData.departure_time));
      setArrivalTime(formatForInput(initialData.arrival_time));
    } else {
      setLineId(lines[0]?.id || '');
      setTrainId(trains[0]?.id || '');

      // Set default departure to tomorrow 06:00 and arrival to tomorrow 14:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      const arrival = new Date(tomorrow);
      arrival.setHours(14, 0, 0, 0);

      setDepartureTime(formatForInput(tomorrow.toISOString()));
      setArrivalTime(formatForInput(arrival.toISOString()));
    }
  }, [initialData, isOpen, lines, trains]);

  if (!isOpen) return null;

  // Calculate live trip duration preview
  const getDurationPreview = (): string => {
    if (!departureTime || !arrivalTime) return '--';
    const dep = new Date(departureTime).getTime();
    const arr = new Date(arrivalTime).getTime();
    if (isNaN(dep) || isNaN(arr) || arr <= dep) return 'Invalid (Arrival must be after departure)';

    const diffMins = Math.round((arr - dep) / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    return `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
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

    setIsSubmitting(true);

    try {
      const depIso = depDate.toISOString();
      const arrIso = arrDate.toISOString();

      if (isEditMode && initialData) {
        const updatePayload: UpdateSchedulePayload = {
          line_id: lineId,
          train_id: trainId,
          departure_time: depIso,
          arrival_time: arrIso,
        };
        await onSaveUpdate(initialData.id, updatePayload);
        toast.success('Train schedule updated successfully.');
      } else {
        const createPayload: CreateSchedulePayload = {
          line_id: lineId,
          train_id: trainId,
          departure_time: depIso,
          arrival_time: arrIso,
        };
        await onSaveCreate(createPayload);
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
        {/* Modal Header */}
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
                Assign a train to a line route and schedule departure & arrival timestamps.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-5">
          {/* Select Railway Line */}
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

          {/* Select Assigned Train */}
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

          {/* Departure & Arrival Times Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departure Time */}
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

            {/* Arrival Time */}
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

          {/* Trip Duration Live Calculation Badge */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Estimated Trip Duration:</span>
            <span className="text-indigo-600 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
              {getDurationPreview()}
            </span>
          </div>

          {/* Modal Footer */}
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
                  <span>{isEditMode ? 'Save Schedule Changes' : 'Confirm Schedule Session'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
