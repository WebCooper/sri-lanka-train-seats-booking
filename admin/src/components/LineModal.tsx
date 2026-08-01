import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2, Route, Loader2 } from 'lucide-react';
import type { 
  RailwayLine, 
  Station, 
  CreateLinePayload, 
  UpdateLinePayload 
} from '../api/trainManagementApi';
import { fetchAllStationsApi } from '../api/trainManagementApi';
import toast from 'react-hot-toast';

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (payload: CreateLinePayload) => Promise<void>;
  onSaveUpdate: (id: string, payload: UpdateLinePayload) => Promise<void>;
  initialData?: RailwayLine | null;
}

interface IntermediateStationState {
  stationId: string;
  distanceFromStart: number;
}

export const LineModal: React.FC<LineModalProps> = ({
  isOpen,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lineName, setLineName] = useState('');
  const [startStationId, setStartStationId] = useState('');
  const [endStationId, setEndStationId] = useState('');
  const [intermediateStations, setIntermediateStations] = useState<IntermediateStationState[]>([]);

  // Fetch stations from backend when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingStations(true);
      fetchAllStationsApi()
        .then((fetched) => {
          setStations(fetched);
          if (!initialData && fetched.length > 1) {
            setStartStationId(fetched[0].id);
            setEndStationId(fetched[fetched.length - 1].id);
          }
        })
        .catch(() => {
          toast.error('Failed to load railway stations from backend.');
        })
        .finally(() => {
          setIsLoadingStations(false);
        });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData) {
      setLineName(initialData.name || '');
      setStartStationId(initialData.start_station?.id || '');
      setEndStationId(initialData.end_station?.id || '');
      
      const middleStations = initialData.stations.map((s) => ({
        stationId: s.id,
        distanceFromStart: s.distance_from_start ?? 0,
      }));
      setIntermediateStations(middleStations);
    } else {
      setLineName('');
      setIntermediateStations([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const getStationDistance = (stId: string): number => {
    const st = stations.find((s) => s.id === stId);
    return st?.cumulativeDistance ?? 0;
  };

  const handleAddIntermediateStation = () => {
    const selectedIds = new Set([startStationId, endStationId, ...intermediateStations.map((s) => s.stationId)]);
    const available = stations.find((s) => !selectedIds.has(s.id));
    
    if (available) {
      const startDist = getStationDistance(startStationId);
      const calculatedDist = Math.max(0, Math.round((available.cumulativeDistance ?? 0) - startDist));
      setIntermediateStations([
        ...intermediateStations,
        { stationId: available.id, distanceFromStart: calculatedDist },
      ]);
    } else {
      toast.error('All available stations are already added to this line route.');
    }
  };

  const handleRemoveIntermediateStation = (index: number) => {
    const updated = [...intermediateStations];
    updated.splice(index, 1);
    setIntermediateStations(updated);
  };

  const handleIntermediateStationChange = (index: number, newStationId: string) => {
    const updated = [...intermediateStations];
    const startDist = getStationDistance(startStationId);
    const newSt = stations.find((s) => s.id === newStationId);
    const calculatedDist = Math.max(0, Math.round((newSt?.cumulativeDistance ?? 0) - startDist));

    updated[index] = {
      stationId: newStationId,
      distanceFromStart: calculatedDist,
    };
    setIntermediateStations(updated);
  };

  const handleDistanceChange = (index: number, dist: number) => {
    const updated = [...intermediateStations];
    updated[index] = {
      ...updated[index],
      distanceFromStart: dist,
    };
    setIntermediateStations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lineName.trim()) {
      toast.error('Line name is required.');
      return;
    }

    if (!startStationId || !endStationId) {
      toast.error('Please select both start and end stations.');
      return;
    }

    if (startStationId === endStationId) {
      toast.error('Start station and end station cannot be identical.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedIntermediate = intermediateStations.map((s) => ({
        station_id: s.stationId,
        distance_from_start: s.distanceFromStart,
      }));

      if (isEditMode && initialData) {
        const updatePayload: UpdateLinePayload = {
          name: lineName.trim(),
          start_station_id: startStationId,
          end_station_id: endStationId,
          stations: formattedIntermediate,
        };
        await onSaveUpdate(initialData.id, updatePayload);
        toast.success('Railway line updated successfully.');
      } else {
        const createPayload: CreateLinePayload = {
          name: lineName.trim(),
          start_station_id: startStationId,
          end_station_id: endStationId,
          stations: formattedIntermediate,
        };
        await onSaveCreate(createPayload);
        toast.success('New railway line created successfully.');
      }
      onClose();
    } catch {
      // Error handled upstream
    } fontFinally: {
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
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Railway Line' : 'Create Railway Line'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure line route name, origin, destination, and intermediate station stops.
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
        {isLoadingStations ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-medium">Loading railway stations...</p>
          </div>
        ) : (
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
                  required
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.code}) - {st.cumulativeDistance ?? 0} km
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
                  required
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.code}) - {st.cumulativeDistance ?? 0} km
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
                  <span>Add Stop</span>
                </button>
              </div>

              {intermediateStations.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                  No intermediate station stops added. Line connects origin and destination directly.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {intermediateStations.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                      
                      <select
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-indigo-600 outline-none"
                        value={st.stationId}
                        onChange={(e) => handleIntermediateStationChange(idx, e.target.value)}
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500">Dist:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 text-center outline-none focus:border-indigo-600"
                          value={st.distanceFromStart}
                          onChange={(e) => handleDistanceChange(idx, parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-[11px] font-semibold text-slate-400">km</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIntermediateStation(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Save Line Changes' : 'Create Railway Line'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
