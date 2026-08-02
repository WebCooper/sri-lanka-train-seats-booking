import React, { useState, useEffect } from 'react';
import { X, Train, Plus, Trash2, ShieldCheck, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import type { 
  TrainConfig, 
  RailwayLine, 
  FormCoachState,
  CreateTrainPayload,
  UpdateTrainPayload,
  CoachClass,
  SeatConfiguration,
} from '../api/trainManagementApi';
import {
  generateDefaultCoaches,
  COACH_CLASSES,
  COACH_CLASS_LABELS,
  SEAT_CONFIGURATIONS,
  isSeatCountCompatible,
  seatsPerRow,
} from '../api/trainManagementApi';
import toast from 'react-hot-toast';

interface TrainConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (payload: CreateTrainPayload, formCoaches: FormCoachState[]) => Promise<void>;
  onSaveUpdate: (id: string, payload: UpdateTrainPayload, formCoaches: FormCoachState[]) => Promise<void>;
  lines: RailwayLine[];
  initialData?: TrainConfig | null;
}

export const TrainConfigModal: React.FC<TrainConfigModalProps> = ({
  isOpen,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  lines,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [trainName, setTrainName] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [lineId, setLineId] = useState('');
  const [coaches, setCoaches] = useState<FormCoachState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTrainName(initialData.name || '');
      setTrainNumber(initialData.train_number || '');
      setLineId(initialData.line?.id || (lines[0]?.id || ''));

      if (initialData.coaches && initialData.coaches.length > 0) {
        const loadedCoaches: FormCoachState[] = initialData.coaches.map((c, idx) => ({
          id: c.id,
          identifier: c.identifier || `${initialData.train_number}-${String.fromCharCode(65 + idx)}`,
          position: idx + 1,
          seatCount: c.seat_count ?? 40,
          isReserved: c.is_reserved ?? false,
          coachClass: c.coach_class ?? (c.is_reserved ? 'FIRST' : 'THIRD'),
          seatConfiguration: (c.seat_configuration as SeatConfiguration) ?? '2+2',
        }));
        setCoaches(loadedCoaches);
      } else {
        setCoaches(generateDefaultCoaches(initialData.train_number || '1005', 8, 3, 40));
      }
    } else {
      const defaultNumber = '1005';
      setTrainName('');
      setTrainNumber(defaultNumber);
      setLineId(lines[0]?.id || '');
      setCoaches(generateDefaultCoaches(defaultNumber, 8, 3, 40));
    }
  }, [initialData, isOpen, lines]);

  // Update coach identifiers dynamically whenever trainNumber changes
  const handleTrainNumberChange = (newNum: string) => {
    setTrainNumber(newNum);
    const cleanNum = newNum.trim() || 'TRAIN';
    setCoaches((prev) =>
      prev.map((c, idx) => ({
        ...c,
        identifier: `${cleanNum}-${String.fromCharCode(65 + idx)}`,
      }))
    );
  };

  if (!isOpen) return null;

  const handleResetToDefaultPreset = () => {
    const cleanNum = trainNumber.trim() || '1005';
    setCoaches(generateDefaultCoaches(cleanNum, 8, 3, 40));
    toast.success('Reset layout to default preset (8 coaches: 3 reservable 1st class, 40 seats each).');
  };

  const handleAddCoach = () => {
    const cleanNum = trainNumber.trim() || '1005';
    const newPos = coaches.length + 1;
    const letter = String.fromCharCode(65 + coaches.length);
    const isReserved = newPos <= 3;

    const newCoach: FormCoachState = {
      identifier: `${cleanNum}-${letter}`,
      position: newPos,
      seatCount: 40,
      isReserved,
      coachClass: isReserved ? 'FIRST' : 'THIRD',
      seatConfiguration: isReserved ? '2+2' : '2+3',
    };
    setCoaches([...coaches, newCoach]);
  };

  const handleRemoveCoach = (index: number) => {
    if (coaches.length <= 1) {
      toast.error('Train must have at least 1 coach.');
      return;
    }
    const cleanNum = trainNumber.trim() || '1005';
    const updated = coaches
      .filter((_, i) => i !== index)
      .map((c, idx) => ({
        ...c,
        position: idx + 1,
        identifier: `${cleanNum}-${String.fromCharCode(65 + idx)}`,
      }));
    setCoaches(updated);
  };

  const handleCoachChange = (index: number, key: keyof FormCoachState, value: any) => {
    const updated = [...coaches];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setCoaches(updated);
  };

  const reservableCount = coaches.filter((c) => c.isReserved).length;
  const totalSeats = coaches.reduce((acc, c) => acc + (Number(c.seatCount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trainName.trim()) {
      toast.error('Train name is required.');
      return;
    }

    if (!trainNumber.trim()) {
      toast.error('Train number is required.');
      return;
    }

    for (const coach of coaches) {
      if (!isSeatCountCompatible(coach.seatCount, coach.seatConfiguration)) {
        toast.error(
          `Coach ${coach.identifier}: seat count must be divisible by ${seatsPerRow(coach.seatConfiguration)} for a ${coach.seatConfiguration} layout.`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        const updatePayload: UpdateTrainPayload = {
          name: trainName.trim(),
          train_number: trainNumber.trim(),
          line_id: lineId || undefined,
        };
        await onSaveUpdate(initialData.id, updatePayload, coaches);
        toast.success('Train configuration updated successfully.');
      } else {
        const createPayload: CreateTrainPayload = {
          name: trainName.trim(),
          train_number: trainNumber.trim(),
          line_id: lineId || undefined,
        };
        await onSaveCreate(createPayload, coaches);
        toast.success('New train configuration created successfully.');
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
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto no-scrollbar bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Train Configuration' : 'Configure New Train'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set train details, assign a line route, and configure coach composition & reservable seat capacity.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-6">
          {/* Train Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Train Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Train Name *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                placeholder="e.g. Podi Menike"
                value={trainName}
                onChange={(e) => setTrainName(e.target.value)}
                required
              />
            </div>

            {/* Train Number */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Train Number *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                placeholder="e.g. 1005"
                value={trainNumber}
                onChange={(e) => handleTrainNumberChange(e.target.value)}
                required
              />
            </div>

            {/* Assigned Line */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Assigned Line Route</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
              >
                <option value="">-- Select Railway Line --</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach & Seat Configuration Header */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Coach & Seat Composition
                </h3>
                <p className="text-xs text-slate-500">
                  Coaches are named automatically using <strong className="text-slate-700">"Train Number - Alphabetical Order"</strong> (e.g. {trainNumber || '1005'}-A, {trainNumber || '1005'}-B).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Reset to default 8 coaches with 3 reservable"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Default Preset (8 Coaches, 3 Reservable)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCoach}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Coach</span>
                </button>
              </div>
            </div>

            {/* Real-Time Live Summary Pill */}
            <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-slate-800">
                  Total Coaches: <strong className="text-indigo-600">{coaches.length}</strong>
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Reservable: <strong>{reservableCount} Coaches</strong>
                </span>
                <span className="text-slate-600">
                  Unreserved: <strong>{coaches.length - reservableCount} Coaches</strong>
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Total Fleet Capacity: <span className="text-indigo-600">{totalSeats} Seats</span>
              </div>
            </div>

            {/* Coach List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1 no-scrollbar">
              {coaches.map((coach, index) => {
                const layoutValid = isSeatCountCompatible(
                  coach.seatCount,
                  coach.seatConfiguration,
                );

                return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border transition-all ${
                    coach.isReserved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {coach.position}
                      </span>
                      Code: <span className="text-indigo-600 font-mono">{coach.identifier}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveCoach(index)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Remove coach"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Class</label>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-900 outline-none focus:border-indigo-600"
                        value={coach.coachClass}
                        onChange={(e) =>
                          handleCoachChange(index, 'coachClass', e.target.value as CoachClass)
                        }
                      >
                        {COACH_CLASSES.map((coachClass) => (
                          <option key={coachClass} value={coachClass}>
                            {COACH_CLASS_LABELS[coachClass]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Seat layout</label>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-900 outline-none focus:border-indigo-600"
                        value={coach.seatConfiguration}
                        onChange={(e) =>
                          handleCoachChange(
                            index,
                            'seatConfiguration',
                            e.target.value as SeatConfiguration,
                          )
                        }
                      >
                        {SEAT_CONFIGURATIONS.map((config) => (
                          <option key={config} value={config}>
                            {config}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Seats:</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className={`w-16 px-2 py-1 bg-white border rounded-lg text-xs font-bold text-slate-900 text-center outline-none focus:border-indigo-600 ${
                          layoutValid ? 'border-slate-200' : 'border-red-300 bg-red-50'
                        }`}
                        value={coach.seatCount}
                        onChange={(e) =>
                          handleCoachChange(index, 'seatCount', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        checked={coach.isReserved}
                        onChange={(e) =>
                          handleCoachChange(index, 'isReserved', e.target.checked)
                        }
                      />
                      <span className={coach.isReserved ? 'text-emerald-800' : 'text-slate-500'}>
                        {coach.isReserved ? 'Reservable' : 'Unreserved'}
                      </span>
                    </label>
                  </div>

                  {!layoutValid && (
                    <p className="mt-2 text-[10px] font-medium text-red-600">
                      Seat count must divide evenly by {seatsPerRow(coach.seatConfiguration)} for {coach.seatConfiguration}.
                    </p>
                  )}
                </div>
              );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-65"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? 'Save Train Configuration' : 'Create Train Configuration'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
