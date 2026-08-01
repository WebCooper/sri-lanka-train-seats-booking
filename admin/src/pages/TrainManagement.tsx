import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { 
  ChevronRight, 
  Route, 
  Train, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  MapPin, 
  ArrowRight,
  Ticket,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { 
  fetchLinesApi, 
  createLineApi, 
  updateLineApi, 
  deleteLineApi,
  fetchStationsApi,
  fetchTrainsApi,
  createTrainApi,
  updateTrainApi,
  deleteTrainApi,
  ensureCoachApi,
} from '../api/trainManagementApi';
import type { 
  RailwayLine, 
  CreateLinePayload, 
  UpdateLinePayload,
  TrainConfig,
  FormCoachState,
  CreateTrainPayload,
  UpdateTrainPayload
} from '../api/trainManagementApi';
import { LineModal } from '../components/LineModal';
import { TrainConfigModal } from '../components/TrainConfigModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { getApiErrorMessage } from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const TrainManagement: React.FC = () => {
  // Lines API State
  const [lines, setLines] = useState<RailwayLine[]>([]);
  const [totalLines, setTotalLines] = useState(0);
  const [linePage, setLinePage] = useState(1);
  const [totalLinePages, setTotalLinePages] = useState(1);
  const [isLoadingLines, setIsLoadingLines] = useState(true);

  // Stations Total Count State
  const [totalStationCount, setTotalStationCount] = useState(0);

  // Line Modal State
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<RailwayLine | null>(null);
  const [deletingLine, setDeletingLine] = useState<RailwayLine | null>(null);
  const [isDeletingLine, setIsDeletingLine] = useState(false);

  // Trains API State
  const [trains, setTrains] = useState<TrainConfig[]>([]);
  const [totalTrains, setTotalTrains] = useState(0);
  const [trainPage, setTrainPage] = useState(1);
  const [totalTrainPages, setTotalTrainPages] = useState(1);
  const [isLoadingTrains, setIsLoadingTrains] = useState(true);

  // Train Modal State
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainConfig | null>(null);
  const [deletingTrain, setDeletingTrain] = useState<TrainConfig | null>(null);
  const [isDeletingTrain, setIsDeletingTrain] = useState(false);

  // Fetch Lines from Backend API (GET /api/v1/admin/lines)
  const loadLines = useCallback(async (page = 1) => {
    setIsLoadingLines(true);
    try {
      const res = await fetchLinesApi({ page, limit: 10 });
      setLines(res.data);
      setTotalLines(res.total);
      setLinePage(res.page);
      setTotalLinePages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch railway lines from server.'));
    } finally {
      setIsLoadingLines(false);
    }
  }, []);

  // Fetch Trains from Backend API (GET /api/v1/admin/trains)
  const loadTrains = useCallback(async (page = 1) => {
    setIsLoadingTrains(true);
    try {
      const res = await fetchTrainsApi({ page, limit: 10 });
      setTrains(res.data);
      setTotalTrains(res.total);
      setTrainPage(res.page);
      setTotalTrainPages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch train fleet from server.'));
    } finally {
      setIsLoadingTrains(false);
    }
  }, []);

  // Fetch Total Stations Count from Backend API (GET /api/v1/admin/stations)
  const loadStationsCount = useCallback(async () => {
    try {
      const res = await fetchStationsApi({ page: 1, limit: 1 });
      setTotalStationCount(res.total);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadLines(linePage);
    loadTrains(trainPage);
    loadStationsCount();
  }, [loadLines, loadTrains, loadStationsCount, linePage, trainPage]);

  // Line Handlers
  const handleOpenCreateLine = () => {
    setEditingLine(null);
    setIsLineModalOpen(true);
  };

  const handleOpenEditLine = (line: RailwayLine) => {
    setEditingLine(line);
    setIsLineModalOpen(true);
  };

  const handleCreateLineSubmit = async (payload: CreateLinePayload) => {
    try {
      await createLineApi(payload);
      loadLines(linePage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to create railway line.'));
      throw err;
    }
  };

  const handleUpdateLineSubmit = async (id: string, payload: UpdateLinePayload) => {
    try {
      await updateLineApi(id, payload);
      loadLines(linePage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update railway line.'));
      throw err;
    }
  };

  const handleConfirmDeleteLine = async () => {
    if (!deletingLine) return;
    setIsDeletingLine(true);
    try {
      await deleteLineApi(deletingLine.id);
      toast.success(`Railway line "${deletingLine.name}" deleted successfully.`);
      setDeletingLine(null);
      loadLines(linePage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to delete railway line.'));
    } finally {
      setIsDeletingLine(false);
    }
  };

  // Train Handlers
  const handleOpenCreateTrain = () => {
    setEditingTrain(null);
    setIsTrainModalOpen(true);
  };

  const handleOpenEditTrain = (train: TrainConfig) => {
    setEditingTrain(train);
    setIsTrainModalOpen(true);
  };

  const handleCreateTrainSubmit = async (payload: CreateTrainPayload, formCoaches: FormCoachState[]) => {
    try {
      // 1. Ensure coaches exist in DB with format "train_number - letter"
      const coachIds: string[] = [];
      for (const fc of formCoaches) {
        const coachId = await ensureCoachApi(fc.identifier, fc.seatCount, fc.isReserved);
        coachIds.push(coachId);
      }

      // 2. Create Train with coach IDs
      await createTrainApi({
        ...payload,
        coach_ids: coachIds,
      });

      loadTrains(trainPage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to create train configuration.'));
      throw err;
    }
  };

  const handleUpdateTrainSubmit = async (id: string, payload: UpdateTrainPayload, formCoaches: FormCoachState[]) => {
    try {
      // 1. Ensure coaches exist in DB
      const coachIds: string[] = [];
      for (const fc of formCoaches) {
        const coachId = await ensureCoachApi(fc.identifier, fc.seatCount, fc.isReserved);
        coachIds.push(coachId);
      }

      // 2. Update Train with coach IDs
      await updateTrainApi(id, {
        ...payload,
        coach_ids: coachIds,
      });

      loadTrains(trainPage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update train configuration.'));
      throw err;
    }
  };

  const handleConfirmDeleteTrain = async () => {
    if (!deletingTrain) return;
    setIsDeletingTrain(true);
    try {
      await deleteTrainApi(deletingTrain.id);
      toast.success(`Train "${deletingTrain.name}" deleted successfully.`);
      setDeletingTrain(null);
      loadTrains(trainPage);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to delete train.'));
    } finally {
      setIsDeletingTrain(false);
    }
  };

  const totalSeatsAllTrains = trains.reduce((acc, t) => acc + (t.total_seat_count || 0), 0);
  const totalReservableCoaches = trains.reduce(
    (acc, t) => acc + (t.coaches ? t.coaches.filter((c) => c.is_reserved).length : 0),
    0
  );

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link to="/dashboard" className="text-indigo-600 hover:underline font-medium">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">Train & Line Management</span>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Train & Line Management
          </h1>
          <p className="text-sm text-slate-500">
            Configure railway lines, manage train fleets, assign route lines, and set coach seat reservations.
          </p>
        </div>
      </div>

      {/* Top Stat Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalLines}</div>
            <div className="text-xs text-slate-500 font-medium">Railway Lines</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalTrains}</div>
            <div className="text-xs text-slate-500 font-medium">Configured Trains</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalStationCount || 257}</div>
            <div className="text-xs text-slate-500 font-medium">Active Stations</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalReservableCoaches}</div>
            <div className="text-xs text-slate-500 font-medium">Reservable Coaches</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalSeatsAllTrains}</div>
            <div className="text-xs text-slate-500 font-medium">Total Seats</div>
          </div>
        </div>
      </div>

      {/* Two Main Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD 1: Railway Lines Management */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Railway Lines</h2>
                  <p className="text-xs text-slate-500">Create & manage active railway line routes</p>
                </div>
              </div>

              <button
                onClick={handleOpenCreateLine}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Line</span>
              </button>
            </div>

            {/* Lines List Content */}
            {isLoadingLines ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-medium">Loading railway lines from backend...</p>
              </div>
            ) : lines.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Route className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 mb-0.5">No Railway Lines Registered</h3>
                <p className="text-xs">Click "Create Line" above to add your first train route.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{line.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 shrink-0">
                          {line.stations?.length || 0} Stops
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          <strong>{line.start_station?.name}</strong> ({line.start_station?.code})
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          <strong>{line.end_station?.name}</strong> ({line.end_station?.code})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditLine(line)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Railway Line"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingLine(line)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Railway Line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Line Pagination Controls */}
            {!isLoadingLines && totalLinePages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Page {linePage} of {totalLinePages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLinePage((p) => Math.max(1, p - 1))}
                    disabled={linePage <= 1}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLinePage((p) => Math.min(totalLinePages, p + 1))}
                    disabled={linePage >= totalLinePages}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Train Configuration & Fleet Window */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                  <Train className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Train Configurations</h2>
                  <p className="text-xs text-slate-500">Assign lines, configure coaches & reservable seats</p>
                </div>
              </div>

              <button
                onClick={handleOpenCreateTrain}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Configure Train</span>
              </button>
            </div>

            {/* Configured Trains List Content */}
            {isLoadingTrains ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="w-7 h-7 animate-spin text-sky-600 mx-auto mb-2" />
                <p className="text-xs font-medium">Loading trains from backend...</p>
              </div>
            ) : trains.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Train className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 mb-0.5">No Trains Configured</h3>
                <p className="text-xs">Click "Configure Train" above to setup your first train fleet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {trains.map((train) => {
                  const reservable = train.coaches
                    ? train.coaches.filter((c) => c.is_reserved).length
                    : 0;
                  return (
                    <div
                      key={train.id}
                      className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {train.name} (#{train.train_number})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                            {reservable} / {train.coach_count || 0} Reservable
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <Layers className="w-3.5 h-3.5" />
                            {train.line?.name || 'Unassigned Line'}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>{train.total_seat_count || 0}</strong> Seats Total
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditTrain(train)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Open Configuration Window"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTrain(train)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Train Configuration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Train Pagination Controls */}
            {!isLoadingTrains && totalTrainPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Page {trainPage} of {totalTrainPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTrainPage((p) => Math.max(1, p - 1))}
                    disabled={trainPage <= 1}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTrainPage((p) => Math.min(totalTrainPages, p + 1))}
                    disabled={trainPage >= totalTrainPages}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Railway Line Modal */}
      <LineModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        onSaveCreate={handleCreateLineSubmit}
        onSaveUpdate={handleUpdateLineSubmit}
        initialData={editingLine}
      />

      {/* Train Configuration Modal */}
      <TrainConfigModal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        onSaveCreate={handleCreateTrainSubmit}
        onSaveUpdate={handleUpdateTrainSubmit}
        lines={lines}
        initialData={editingTrain}
      />

      {/* Delete Line Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingLine)}
        onClose={() => setDeletingLine(null)}
        onConfirm={handleConfirmDeleteLine}
        title="Delete Railway Line"
        message={
          deletingLine
            ? `Are you sure you want to delete "${deletingLine.name}"? This action will remove the line route from the system.`
            : ''
        }
        confirmText="Delete Line"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingLine}
      />

      {/* Delete Train Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTrain)}
        onClose={() => setDeletingTrain(null)}
        onConfirm={handleConfirmDeleteTrain}
        title="Delete Train Configuration"
        message={
          deletingTrain
            ? `Are you sure you want to delete train configuration "${deletingTrain.name}" (#${deletingTrain.train_number})?`
            : ''
        }
        confirmText="Delete Train"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingTrain}
      />
    </div>
  );
};
