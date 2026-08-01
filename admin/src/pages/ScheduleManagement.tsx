import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  Route, 
  Train, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  ArrowRight,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { 
  fetchSchedulesApi, 
  createScheduleApi, 
  updateScheduleApi, 
  deleteScheduleApi 
} from '../api/scheduleManagementApi';
import type { 
  ScheduleItem, 
  CreateSchedulePayload, 
  UpdateSchedulePayload 
} from '../api/scheduleManagementApi';
import { fetchLinesApi, fetchTrainsApi } from '../api/trainManagementApi';
import type { RailwayLine, TrainConfig } from '../api/trainManagementApi';
import { ScheduleModal } from '../components/ScheduleModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { getApiErrorMessage } from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const ScheduleManagement: React.FC = () => {
  // Schedules API State
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Line & Train dropdown reference states
  const [lines, setLines] = useState<RailwayLine[]>([]);
  const [trains, setTrains] = useState<TrainConfig[]>([]);

  // Filter States
  const [selectedLineFilter, setSelectedLineFilter] = useState('');

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  // Delete Confirm Modal State
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Schedules from Backend API (GET /api/v1/admin/schedules)
  const loadSchedules = useCallback(async (currentPage = 1, lineFilter = '') => {
    setIsLoading(true);
    try {
      const res = await fetchSchedulesApi({
        page: currentPage,
        limit: 10,
        line_id: lineFilter || undefined,
      });
      setSchedules(res.data);
      setTotalSchedules(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch train schedules from server.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Lines & Trains for Modal Selectors
  const loadReferences = useCallback(async () => {
    try {
      const [linesRes, trainsRes] = await Promise.all([
        fetchLinesApi({ page: 1, limit: 100 }),
        fetchTrainsApi({ page: 1, limit: 100 }),
      ]);
      setLines(linesRes.data);
      setTrains(trainsRes.data);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadSchedules(page, selectedLineFilter);
    loadReferences();
  }, [loadSchedules, loadReferences, page, selectedLineFilter]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: ScheduleItem) => {
    setEditingSchedule(sch);
    setIsModalOpen(true);
  };

  const handleCreateScheduleSubmit = async (payload: CreateSchedulePayload) => {
    try {
      await createScheduleApi(payload);
      loadSchedules(page, selectedLineFilter);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to schedule train session.'));
      throw err;
    }
  };

  const handleUpdateScheduleSubmit = async (id: string, payload: UpdateSchedulePayload) => {
    try {
      await updateScheduleApi(id, payload);
      loadSchedules(page, selectedLineFilter);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update schedule session.'));
      throw err;
    }
  };

  const handleConfirmDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    setIsDeleting(true);
    try {
      await deleteScheduleApi(deletingSchedule.id);
      toast.success('Scheduled train session canceled successfully.');
      setDeletingSchedule(null);
      loadSchedules(page, selectedLineFilter);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel schedule session.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link to="/dashboard" className="text-indigo-600 hover:underline font-medium">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">Train Calendar & Schedules</span>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Train Calendar & Schedule Management
          </h1>
          <p className="text-sm text-slate-500">
            Create departure timetables, schedule train sessions along line routes, and manage operational calendars.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Stat Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalSchedules}</div>
            <div className="text-xs text-slate-500 font-medium">Total Schedules</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{trains.length}</div>
            <div className="text-xs text-slate-500 font-medium">Available Trains</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{lines.length}</div>
            <div className="text-xs text-slate-500 font-medium">Railway Lines</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Active</div>
            <div className="text-xs text-slate-500 font-medium">Timetable Engine</div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 shrink-0">Filter by Line:</label>
            <select
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
              value={selectedLineFilter}
              onChange={(e) => {
                setSelectedLineFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Railway Lines</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedules Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-medium">Loading train schedules from backend...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No Scheduled Train Sessions
            </h3>
            <p className="text-xs">
              Click "Schedule New Session" above to create train timetables.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Train Fleet</th>
                  <th className="py-3.5 px-5">Assigned Line Route</th>
                  <th className="py-3.5 px-5">Departure Time</th>
                  <th className="py-3.5 px-5">Arrival Time</th>
                  <th className="py-3.5 px-5">Duration</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {schedules.map((sch) => {
                  const depDate = new Date(sch.departure_time);
                  const arrDate = new Date(sch.arrival_time);
                  const hrs = Math.floor(sch.duration_minutes / 60);
                  const mins = sch.duration_minutes % 60;

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Train Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold">
                            <Train className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {sch.train?.name || 'Unassigned Train'} (#{sch.train?.train_number || 'N/A'})
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {sch.train?.coach_count || 0} Coaches • {sch.train?.total_seat_count || 0} Seats
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Line Route */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900 text-xs mb-0.5">
                          {sch.line?.name || 'Unassigned Line'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>
                            <strong>{sch.line?.start_station?.name}</strong> ({sch.line?.start_station?.code})
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            <strong>{sch.line?.end_station?.name}</strong> ({sch.line?.end_station?.code})
                          </span>
                        </div>
                      </td>

                      {/* Departure */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-xs text-slate-900">
                          {depDate.toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Arrival */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-xs text-slate-900">
                          {arrDate.toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {hrs}h {mins}m
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(sch)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Schedule Session"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSchedule(sch)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Schedule Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 bg-white border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({totalSchedules} total scheduled sessions)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveCreate={handleCreateScheduleSubmit}
        onSaveUpdate={handleUpdateScheduleSubmit}
        lines={lines}
        trains={trains}
        initialData={editingSchedule}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSchedule)}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleConfirmDeleteSchedule}
        title="Cancel Train Schedule Session"
        message={
          deletingSchedule
            ? `Are you sure you want to cancel scheduled trip for "${deletingSchedule.train?.name}" on line "${deletingSchedule.line?.name}"?`
            : ''
        }
        confirmText="Cancel Schedule"
        cancelText="Keep Schedule"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
