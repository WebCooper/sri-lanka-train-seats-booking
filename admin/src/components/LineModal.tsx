import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2, Route } from 'lucide-react';
import type { RailwayLine } from '../api/trainManagementApi';
import { INITIAL_STATIONS } from '../api/trainManagementApi';
import toast from 'react-hot-toast';

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lineData: RailwayLine) => void;
  initialData?: RailwayLine | null;
}

export const LineModal: React.FC<LineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [lineName, setLineName] = useState('');
  const [startStationId, setStartStationId] = useState('st-1');
  const [endStationId, setEndStationId] = useState('st-5');
  const [intermediateStations, setIntermediateStations] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setLineName(initialData.name || '');
      setStartStationId(initialData.startStationId || 'st-1');
      setEndStationId(initialData.endStationId || 'st-5');
      const middleStationIds = initialData.stations
        .filter((s) => s.stationId !== initialData.startStationId && s.stationId !== initialData.endStationId)
        .map((s) => s.stationId);
      setIntermediateStations(middleStationIds);
    } else {
      setLineName('');
      setStartStationId('st-1');
      setEndStationId('st-5');
      setIntermediateStations([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddIntermediateStation = () => {
    // Pick first available station not already selected as start, end, or intermediate
    const available = INITIAL_STATIONS.find(
      (s) => s.id !== startStationId && s.id !== endStationId && !intermediateStations.includes(s.id)
    );
    if (available) {
      setIntermediateStations([...intermediateStations, available.id]);
    } else {
      toast.error('All available stations are already included on this line.');
    }
  };

  const handleRemoveIntermediateStation = (index: number) => {
    const updated = [...intermediateStations];
    updated.splice(index, 1);
    setIntermediateStations(updated);
  };

  const handleIntermediateChange = (index: number, stationId: string) => {
    const updated = [...intermediateStations];
    updated[index] = stationId;
    setIntermediateStations(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lineName.trim()) {
      toast.error('Line name is required.');
      return;
    }

    if (startStationId === endStationId) {
      toast.error('Start station and end station cannot be identical.');
      return;
    }

    const startSt = INITIAL_STATIONS.find((s) => s.id === startStationId);
    const endSt = INITIAL_STATIONS.find((s) => s.id === endStationId);

    if (!startSt || !endSt) {
      toast.error('Invalid start or end station.');
      return;
    }

    const fullStationSequence = [
      startStationId,
      ...intermediateStations,
      endStationId,
    ];

    const formattedStations = fullStationSequence.map((stId, index) => {
      const st = INITIAL_STATIONS.find((s) => s.id === stId);
      return {
        stationId: stId,
        stationName: st?.name || 'Unknown Station',
        stationCode: st?.code || 'UNK',
        position: index + 1,
        distanceFromStart: index * 60,
      };
    });

    const newLineObj: RailwayLine = {
      id: initialData?.id || `line-${Date.now()}`,
      name: lineName.trim(),
      startStationId: startSt.id,
      startStationName: startSt.name,
      startStationCode: startSt.code,
      endStationId: endSt.id,
      endStationName: endSt.name,
      endStationCode: endSt.code,
      stations: formattedStations,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(newLineObj);
    toast.success(isEditMode ? 'Railway line updated.' : 'New railway line created.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Railway Line' : 'Create Railway Line'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure line route, origin, destination, and intermediate station stops.
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
        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-5">
          {/* Line Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Railway Line Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              placeholder="e.g. Main Line (Colombo - Badulla)"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              required
            />
          </div>

          {/* Origin & Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Station */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Origin / Start Station *</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={startStationId}
                onChange={(e) => setStartStationId(e.target.value)}
              >
                {INITIAL_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* End Station */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Destination / End Station *</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={endStationId}
                onChange={(e) => setEndStationId(e.target.value)}
              >
                {INITIAL_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Intermediate Stations Section */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Intermediate Station Sequence</span>
              </label>
              <button
                type="button"
                onClick={handleAddIntermediateStation}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Station</span>
              </button>
            </div>

            {intermediateStations.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                No intermediate stations added. Line will connect start & end station directly.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {intermediateStations.map((stId, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                    <select
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      value={stId}
                      onChange={(e) => handleIntermediateChange(idx, e.target.value)}
                    >
                      {INITIAL_STATIONS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.code})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveIntermediateStation(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove station"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              {isEditMode ? 'Save Line Changes' : 'Create Railway Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
