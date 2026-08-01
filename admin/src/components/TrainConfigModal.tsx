import React, { useState, useEffect } from 'react';
import { X, Train, Plus, Trash2, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { TrainConfig, CoachConfig, RailwayLine } from '../api/trainManagementApi';
import { generateDefaultCoaches } from '../api/trainManagementApi';
import toast from 'react-hot-toast';

interface TrainConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trainData: TrainConfig) => void;
  lines: RailwayLine[];
  initialData?: TrainConfig | null;
}

export const TrainConfigModal: React.FC<TrainConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lines,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [trainName, setTrainName] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [lineId, setLineId] = useState('');
  const [coaches, setCoaches] = useState<CoachConfig[]>([]);

  useEffect(() => {
    if (initialData) {
      setTrainName(initialData.name || '');
      setTrainNumber(initialData.trainNumber || '');
      setLineId(initialData.lineId || (lines[0]?.id || ''));
      setCoaches(initialData.coaches || generateDefaultCoaches(8, 3, 54));
    } else {
      setTrainName('');
      setTrainNumber('');
      setLineId(lines[0]?.id || '');
      // DEFAULT SPECIFIED BY USER: 8 Coaches, 3 Reservable
      setCoaches(generateDefaultCoaches(8, 3, 54));
    }
  }, [initialData, isOpen, lines]);

  if (!isOpen) return null;

  const handleResetToDefaultPreset = () => {
    // Reset to user specification: 8 coaches, 3 reservable, 54 seats
    setCoaches(generateDefaultCoaches(8, 3, 54));
    toast.success('Reset coach layout to default preset (8 Coaches, 3 Reservable).');
  };

  const handleAddCoach = () => {
    const newPos = coaches.length + 1;
    const isReserved = newPos <= 3;
    const newCoach: CoachConfig = {
      id: `coach-${Date.now()}-${newPos}`,
      identifier: `Coach ${String.fromCharCode(65 + coaches.length)} (${isReserved ? 'Reserved' : 'Standard'})`,
      position: newPos,
      seatCount: 54,
      isReserved,
    };
    setCoaches([...coaches, newCoach]);
  };

  const handleRemoveCoach = (index: number) => {
    if (coaches.length <= 1) {
      toast.error('Train must have at least 1 coach.');
      return;
    }
    const updated = coaches.filter((_, i) => i !== index).map((c, idx) => ({
      ...c,
      position: idx + 1,
      identifier: `Coach ${String.fromCharCode(65 + idx)} (${c.isReserved ? 'Reserved' : 'Standard'})`,
    }));
    setCoaches(updated);
  };

  const handleCoachChange = (index: number, key: keyof CoachConfig, value: any) => {
    const updated = [...coaches];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    // Update identifier label if reservation status changed
    if (key === 'isReserved') {
      updated[index].identifier = `Coach ${String.fromCharCode(65 + index)} (${value ? 'Reserved' : 'Standard'})`;
    }
    setCoaches(updated);
  };

  const reservableCount = coaches.filter((c) => c.isReserved).length;
  const totalSeats = coaches.reduce((acc, c) => acc + (Number(c.seatCount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trainName.trim()) {
      toast.error('Train name is required.');
      return;
    }

    if (!trainNumber.trim()) {
      toast.error('Train number is required.');
      return;
    }

    if (!lineId) {
      toast.error('Please assign a railway line to this train.');
      return;
    }

    const assignedLine = lines.find((l) => l.id === lineId);

    const newTrainObj: TrainConfig = {
      id: initialData?.id || `trn-${Date.now()}`,
      name: trainName.trim(),
      trainNumber: trainNumber.trim(),
      lineId,
      lineName: assignedLine?.name || 'Assigned Line',
      totalCoaches: coaches.length,
      reservableCoaches: reservableCount,
      totalSeats,
      coaches,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(newTrainObj);
    toast.success(isEditMode ? 'Train configuration updated.' : 'New train configuration created.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto no-scrollbar bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
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
                onChange={(e) => setTrainNumber(e.target.value)}
                required
              />
            </div>

            {/* Assigned Line */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Assigned Line Route *</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                required
              >
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
                  Configure coaches and specify which coaches are available for passenger seat reservations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Set default 8 coaches with 3 reservable"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-1 no-scrollbar">
              {coaches.map((coach, index) => (
                <div
                  key={coach.id || index}
                  className={`p-3.5 rounded-xl border transition-all ${
                    coach.isReserved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                        {coach.position}
                      </span>
                      {coach.identifier}
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

                  <div className="flex items-center justify-between gap-3">
                    {/* Seats Count */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Seats:</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center outline-none focus:border-indigo-600"
                        value={coach.seatCount}
                        onChange={(e) =>
                          handleCoachChange(index, 'seatCount', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    {/* Reservable Checkbox */}
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
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditMode ? 'Save Train Configuration' : 'Create Train Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
