import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronRight,
  Coins,
  Loader2,
  Plus,
  Save,
  Trash2,
  Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  COACH_CLASS_LABELS,
  DAY_LABELS,
  createPeakHourRuleApi,
  deletePeakHourRuleApi,
  fetchFareModelApi,
  quoteFareApi,
  updateFareModelApi,
  type FareModelConfig,
  type FareQuoteResult,
  type PeakHourRule,
} from '../api/fareModelApi';
import { fetchAllStationsApi, fetchLinesApi } from '../api/trainManagementApi';
import type { RailwayLine, Station } from '../api/trainManagementApi';
import { getApiErrorMessage } from '../api/axiosInstance';

type PeakRuleForm = {
  id?: string;
  name: string;
  start_time: string;
  end_time: string;
  multiplier: string;
  days_of_week: number[];
};

const emptyPeakRule = (): PeakRuleForm => ({
  name: '',
  start_time: '07:00',
  end_time: '09:00',
  multiplier: '1.25',
  days_of_week: [1, 2, 3, 4, 5],
});

export const FareModelManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [formula, setFormula] = useState('');

  const [flatBookingFee, setFlatBookingFee] = useState('50');
  const [ratePerKm, setRatePerKm] = useState('10');
  const [offPeakMultiplier, setOffPeakMultiplier] = useState('1');
  const [coachMultipliers, setCoachMultipliers] = useState<
    Array<{ coach_class: string; multiplier: string }>
  >([]);
  const [peakRules, setPeakRules] = useState<PeakHourRule[]>([]);
  const [newPeakRule, setNewPeakRule] = useState<PeakRuleForm>(emptyPeakRule());

  const [lines, setLines] = useState<RailwayLine[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [quoteLineId, setQuoteLineId] = useState('');
  const [quoteOriginId, setQuoteOriginId] = useState('');
  const [quoteDestinationId, setQuoteDestinationId] = useState('');
  const [quoteCoachClass, setQuoteCoachClass] = useState('FIRST');
  const [quoteDepartureTime, setQuoteDepartureTime] = useState('');
  const [quoteResult, setQuoteResult] = useState<FareQuoteResult | null>(null);

  const applyConfig = (config: FareModelConfig) => {
    setFormula(config.formula);
    setFlatBookingFee(String(config.flat_booking_fee));
    setRatePerKm(String(config.rate_per_km));
    setOffPeakMultiplier(String(config.off_peak_multiplier));
    setCoachMultipliers(
      config.coach_class_multipliers.map((row) => ({
        coach_class: row.coach_class,
        multiplier: String(row.multiplier),
      })),
    );
    setPeakRules(config.peak_hour_rules);
  };

  const loadFareModel = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await fetchFareModelApi();
      applyConfig(config);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load fare model.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFareModel();
    fetchLinesApi({ page: 1, limit: 100 }).then((res) => setLines(res.data));
    fetchAllStationsApi().then(setStations);
  }, [loadFareModel]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config = await updateFareModelApi({
        flat_booking_fee: Number(flatBookingFee),
        rate_per_km: Number(ratePerKm),
        off_peak_multiplier: Number(offPeakMultiplier),
        coach_class_multipliers: coachMultipliers.map((row) => ({
          coach_class: row.coach_class,
          multiplier: Number(row.multiplier),
        })),
      });
      applyConfig(config);
      toast.success('Fare model updated successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update fare model.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePeakRule = async () => {
    try {
      const created = await createPeakHourRuleApi({
        name: newPeakRule.name,
        start_time: newPeakRule.start_time,
        end_time: newPeakRule.end_time,
        multiplier: Number(newPeakRule.multiplier),
        days_of_week: newPeakRule.days_of_week,
      });
      setPeakRules((prev) => [...prev, created]);
      setNewPeakRule(emptyPeakRule());
      toast.success('Peak hour rule created.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create peak hour rule.'));
    }
  };

  const handleDeletePeakRule = async (rule: PeakHourRule) => {
    try {
      await deletePeakHourRuleApi(rule.id);
      setPeakRules((prev) => prev.filter((row) => row.id !== rule.id));
      toast.success('Peak hour rule deleted.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete peak hour rule.'));
    }
  };

  const toggleDay = (days: number[], day: number) => {
    return days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
  };

  const handleQuote = async () => {
    if (!quoteLineId || !quoteOriginId || !quoteDestinationId || !quoteDepartureTime) {
      toast.error('Select line, stations, and departure time for the quote preview.');
      return;
    }

    setIsQuoting(true);
    try {
      const result = await quoteFareApi({
        line_id: quoteLineId,
        origin_station_id: quoteOriginId,
        destination_station_id: quoteDestinationId,
        coach_class: quoteCoachClass,
        departure_time: new Date(quoteDepartureTime).toISOString(),
      });
      setQuoteResult(result);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to calculate fare quote.'));
    } finally {
      setIsQuoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 py-20 justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading fare model configuration...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/dashboard" className="hover:text-indigo-600 no-underline">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 font-medium">Fare Model</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Fare Model</h1>
        <p className="text-sm text-slate-500">
          Configure flat booking fee, per-km rate, coach class multipliers, and peak/off-peak pricing.
        </p>
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Formula</p>
          <p className="text-sm font-mono text-indigo-900">{formula}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Coins className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Base Fare Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Flat booking fee (LKR)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={flatBookingFee}
                onChange={(e) => setFlatBookingFee(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Rate per km (LKR)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Off-peak multiplier</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={offPeakMultiplier}
                onChange={(e) => setOffPeakMultiplier(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
          </div>

          <h3 className="text-sm font-semibold text-slate-800 mb-3">Coach class multipliers</h3>
          <div className="space-y-3 mb-6">
            {coachMultipliers.map((row, index) => (
              <div key={row.coach_class} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 w-44">
                  {COACH_CLASS_LABELS[row.coach_class] ?? row.coach_class}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={row.multiplier}
                  onChange={(e) => {
                    const next = [...coachMultipliers];
                    next[index] = { ...next[index], multiplier: e.target.value };
                    setCoachMultipliers(next);
                  }}
                  className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save fare settings
          </button>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Quote Preview</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <select
              value={quoteLineId}
              onChange={(e) => setQuoteLineId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select line</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>{line.name}</option>
              ))}
            </select>
            <select
              value={quoteOriginId}
              onChange={(e) => setQuoteOriginId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Origin station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
            <select
              value={quoteDestinationId}
              onChange={(e) => setQuoteDestinationId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Destination station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
            <select
              value={quoteCoachClass}
              onChange={(e) => setQuoteCoachClass(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {coachMultipliers.map((row) => (
                <option key={row.coach_class} value={row.coach_class}>
                  {COACH_CLASS_LABELS[row.coach_class] ?? row.coach_class}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={quoteDepartureTime}
              onChange={(e) => setQuoteDepartureTime(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleQuote}
            disabled={isQuoting}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {isQuoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Calculate quote
          </button>

          {quoteResult && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Fare Calculation Breakdown</p>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between text-slate-700">
                    <span>Flat Booking Fee</span>
                    <span>LKR {quoteResult.flat_booking_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Distance Charge ({quoteResult.distance_km} km)</span>
                    <span>LKR {quoteResult.distance_charge.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-emerald-300 pt-2 flex justify-between text-slate-800 font-semibold">
                    <span>Base Amount</span>
                    <span>LKR {quoteResult.base_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>× Coach Class Multiplier ({COACH_CLASS_LABELS[quoteResult.coach_class]})</span>
                    <span>x{quoteResult.coach_class_multiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>× Time Multiplier ({quoteResult.time_band === 'peak' ? 'Peak' : 'Off-Peak'})</span>
                    <span>x{quoteResult.time_multiplier.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-emerald-300 pt-2 flex justify-between text-emerald-700 font-bold text-base">
                    <span>Final Fare</span>
                    <span>LKR {quoteResult.fare_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Peak hour rules</h2>

        {peakRules.length === 0 ? (
          <p className="text-sm text-slate-500 mb-4">No peak rules configured. Off-peak multiplier applies for all departures.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {peakRules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
                  <p className="text-xs text-slate-500">
                    {rule.start_time} – {rule.end_time} • x{rule.multiplier} •{' '}
                    {rule.days_of_week.map((day) => DAY_LABELS[day]).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePeakRule(rule)}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border border-dashed border-slate-300 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Add peak rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Rule name</span>
              <input
                type="text"
                name="peak_rule_name"
                placeholder="e.g. Morning rush"
                value={newPeakRule.name}
                onChange={(e) => setNewPeakRule({ ...newPeakRule, name: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Multiplier</span>
              <input
                type="number"
                name="peak_rule_multiplier"
                min="0.01"
                step="0.01"
                placeholder="e.g. 1.25"
                value={newPeakRule.multiplier}
                onChange={(e) => setNewPeakRule({ ...newPeakRule, multiplier: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Start time</span>
              <input
                type="time"
                name="peak_rule_start_time"
                value={newPeakRule.start_time}
                onChange={(e) => setNewPeakRule({ ...newPeakRule, start_time: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">End time</span>
              <input
                type="time"
                name="peak_rule_end_time"
                value={newPeakRule.end_time}
                onChange={(e) => setNewPeakRule({ ...newPeakRule, end_time: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Days of week</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {DAY_LABELS.map((label, day) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setNewPeakRule({
                      ...newPeakRule,
                      days_of_week: toggleDay(newPeakRule.days_of_week, day),
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    newPeakRule.days_of_week.includes(day)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreatePeakRule}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add peak rule
          </button>
        </div>
      </section>
    </div>
  );
};
