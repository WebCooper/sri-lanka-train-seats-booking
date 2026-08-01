import React, { useState } from 'react';
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
  Ticket
} from 'lucide-react';
import { 
  INITIAL_LINES, 
  INITIAL_TRAINS
} from '../api/trainManagementApi';
import type { RailwayLine, TrainConfig } from '../api/trainManagementApi';
import { LineModal } from '../components/LineModal';
import { TrainConfigModal } from '../components/TrainConfigModal';
import { ConfirmModal } from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export const TrainManagement: React.FC = () => {
  // State for Railway Lines
  const [lines, setLines] = useState<RailwayLine[]>(INITIAL_LINES);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<RailwayLine | null>(null);
  const [deletingLine, setDeletingLine] = useState<RailwayLine | null>(null);

  // State for Train Configurations
  const [trains, setTrains] = useState<TrainConfig[]>(INITIAL_TRAINS);
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainConfig | null>(null);
  const [deletingTrain, setDeletingTrain] = useState<TrainConfig | null>(null);

  // Line Handlers
  const handleOpenCreateLine = () => {
    setEditingLine(null);
    setIsLineModalOpen(true);
  };

  const handleOpenEditLine = (line: RailwayLine) => {
    setEditingLine(line);
    setIsLineModalOpen(true);
  };

  const handleSaveLine = (lineData: RailwayLine) => {
    const existingIndex = lines.findIndex((l) => l.id === lineData.id);
    if (existingIndex >= 0) {
      const updated = [...lines];
      updated[existingIndex] = lineData;
      setLines(updated);
    } else {
      setLines([lineData, ...lines]);
    }
  };

  const handleConfirmDeleteLine = () => {
    if (!deletingLine) return;
    setLines(lines.filter((l) => l.id !== deletingLine.id));
    toast.success(`Railway line "${deletingLine.name}" deleted.`);
    setDeletingLine(null);
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

  const handleSaveTrain = (trainData: TrainConfig) => {
    const existingIndex = trains.findIndex((t) => t.id === trainData.id);
    if (existingIndex >= 0) {
      const updated = [...trains];
      updated[existingIndex] = trainData;
      setTrains(updated);
    } else {
      setTrains([trainData, ...trains]);
    }
  };

  const handleConfirmDeleteTrain = () => {
    if (!deletingTrain) return;
    setTrains(trains.filter((t) => t.id !== deletingTrain.id));
    toast.success(`Train configuration "${deletingTrain.name}" deleted.`);
    setDeletingTrain(null);
  };

  const totalSeatsAllTrains = trains.reduce((acc, t) => acc + (t.totalSeats || 0), 0);
  const totalReservableCoaches = trains.reduce((acc, t) => acc + (t.reservableCoaches || 0), 0);

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
            <div className="text-2xl font-bold text-slate-900">{lines.length}</div>
            <div className="text-xs text-slate-500 font-medium">Railway Lines</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{trains.length}</div>
            <div className="text-xs text-slate-500 font-medium">Configured Trains</div>
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

            {/* Lines List */}
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
                        {line.stations.length} Stops
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        <strong>{line.startStationName}</strong> ({line.startStationCode})
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        <strong>{line.endStationName}</strong> ({line.endStationCode})
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

            {/* Configured Trains List */}
            <div className="flex flex-col gap-3">
              {trains.map((train) => (
                <div
                  key={train.id}
                  className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {train.name} (#{train.trainNumber})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        {train.reservableCoaches} / {train.totalCoaches} Reservable
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        {train.lineName || 'Assigned Route'}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{train.totalSeats}</strong> Seats Total
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Railway Line Modal */}
      <LineModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        onSave={handleSaveLine}
        initialData={editingLine}
      />

      {/* Train Configuration Modal (Window for train name, line, coaches, seats) */}
      <TrainConfigModal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        onSave={handleSaveTrain}
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
            ? `Are you sure you want to delete "${deletingLine.name}"? Trains assigned to this line will need to be re-assigned.`
            : ''
        }
        confirmText="Delete Line"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Train Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTrain)}
        onClose={() => setDeletingTrain(null)}
        onConfirm={handleConfirmDeleteTrain}
        title="Delete Train Configuration"
        message={
          deletingTrain
            ? `Are you sure you want to delete train configuration "${deletingTrain.name}" (#${deletingTrain.trainNumber})?`
            : ''
        }
        confirmText="Delete Train"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
