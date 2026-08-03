import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  BarChart3,
  ChevronRight,
  Loader2,
  RefreshCw,
  TrendingUp,
  Ticket,
  Layers,
  Train,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  fetchRevenueByCoachClassApi,
  fetchRevenueByScheduleApi,
  fetchRevenueOverTimeApi,
  fetchRevenueSummaryApi,
  fetchSegmentEfficiencyApi,
  type RevenueByCoachClass,
  type RevenueBySchedule,
  type RevenueGranularity,
  type RevenueOverTime,
  type RevenueSummary,
  type SegmentEfficiency,
} from '../api/revenueReportsApi';
import { fetchLinesApi } from '../api/trainManagementApi';
import type { RailwayLine } from '../api/trainManagementApi';
import { COACH_CLASS_LABELS } from '../api/fareModelApi';
import { getApiErrorMessage } from '../api/axiosInstance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const CHART_COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
];

const formatCurrency = (value: number) =>
  `LKR ${value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPeriodLabel = (period: string, granularity: RevenueGranularity) => {
  if (granularity === 'monthly') {
    const [year, month] = period.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-LK', {
      month: 'short',
      year: 'numeric',
    });
  }
  return new Date(period).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    ...(granularity === 'weekly' ? { year: 'numeric' } : {}),
  });
};

export const RevenueAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lines, setLines] = useState<RailwayLine[]>([]);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lineId, setLineId] = useState('');
  const [granularity, setGranularity] = useState<RevenueGranularity>('daily');

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [overTime, setOverTime] = useState<RevenueOverTime | null>(null);
  const [bySchedule, setBySchedule] = useState<RevenueBySchedule | null>(null);
  const [byCoachClass, setByCoachClass] = useState<RevenueByCoachClass | null>(null);
  const [segmentEfficiency, setSegmentEfficiency] = useState<SegmentEfficiency | null>(null);

  const filters = useMemo(
    () => ({
      ...(dateFrom ? { date_from: new Date(dateFrom).toISOString() } : {}),
      ...(dateTo ? { date_to: new Date(`${dateTo}T23:59:59`).toISOString() } : {}),
      ...(lineId ? { line_id: lineId } : {}),
    }),
    [dateFrom, dateTo, lineId],
  );

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, overTimeData, scheduleData, coachClassData, efficiencyData] =
        await Promise.all([
          fetchRevenueSummaryApi(filters),
          fetchRevenueOverTimeApi({ ...filters, granularity }),
          fetchRevenueByScheduleApi(filters),
          fetchRevenueByCoachClassApi(filters),
          fetchSegmentEfficiencyApi(filters),
        ]);

      setSummary(summaryData);
      setOverTime(overTimeData);
      setBySchedule(scheduleData);
      setByCoachClass(coachClassData);
      setSegmentEfficiency(efficiencyData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load revenue reports.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, granularity]);

  useEffect(() => {
    fetchLinesApi({ page: 1, limit: 100 }).then((res) => setLines(res.data));
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const overTimeChart = useMemo(() => {
    if (!overTime?.series.length) return null;

    return {
      labels: overTime.series.map((row) => formatPeriodLabel(row.period, overTime.granularity)),
      datasets: [
        {
          label: 'Revenue (LKR)',
          data: overTime.series.map((row) => row.revenue),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [overTime]);

  const scheduleChart = useMemo(() => {
    if (!bySchedule?.items.length) return null;

    const labels = bySchedule.items.map((row) => {
      const train = row.train_number ?? row.train_name ?? 'Train';
      const date = row.departure_time
        ? new Date(row.departure_time).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
        : '';
      return `${train} (${date})`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Revenue (LKR)',
          data: bySchedule.items.map((row) => row.revenue),
          backgroundColor: CHART_COLORS.slice(0, bySchedule.items.length),
          borderRadius: 8,
        },
      ],
    };
  }, [bySchedule]);

  const coachClassChart = useMemo(() => {
    if (!byCoachClass?.items.length) return null;

    return {
      labels: byCoachClass.items.map(
        (row) => COACH_CLASS_LABELS[row.coach_class] ?? row.coach_class,
      ),
      datasets: [
        {
          data: byCoachClass.items.map((row) => row.revenue),
          backgroundColor: CHART_COLORS.slice(0, byCoachClass.items.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [byCoachClass]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => `LKR ${Number(value).toLocaleString()}`,
        },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: number; label?: string }) =>
            `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/dashboard" className="hover:text-indigo-600 no-underline">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 font-medium">Analytics & Reports</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Revenue Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Segment-based fare revenue from confirmed bookings across schedules and coach classes.
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              From
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Line
            </span>
            <select
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">All lines</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Granularity
            </span>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as RevenueGranularity)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <button
            type="button"
            onClick={loadReports}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </section>

      {isLoading && !summary ? (
        <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Loading revenue analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Gross Revenue</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(summary?.gross_revenue ?? 0)}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Ticket className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Bookings</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{summary?.booking_count ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Avg fare {formatCurrency(summary?.average_fare ?? 0)}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Multi-Segment Seats
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {segmentEfficiency?.summary.multi_segment_seats ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(segmentEfficiency?.summary.multi_segment_revenue ?? 0)} captured
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Train className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Avg Segments / Seat
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {segmentEfficiency?.summary.average_segments_per_seat ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {segmentEfficiency?.summary.seats_analyzed ?? 0} seats analyzed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Revenue Over Time</h2>
              </div>
              <div className="h-72">
                {overTimeChart ? (
                  <Line data={overTimeChart} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No revenue data for the selected period.
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Coach Class</h2>
              <div className="h-72">
                {coachClassChart ? (
                  <Doughnut data={coachClassChart} options={doughnutOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No coach class data available.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Schedules by Revenue</h2>
            <div className="h-80">
              {scheduleChart ? (
                <Bar data={scheduleChart} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No schedule revenue data available.
                </div>
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Segment Efficiency</h2>
            <p className="text-sm text-slate-500 mb-5">
              Seats sold multiple times on the same run — revenue captured via segment pricing.
            </p>

            {segmentEfficiency?.items.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">Train</th>
                      <th className="py-3 pr-4">Line</th>
                      <th className="py-3 pr-4">Coach / Seat</th>
                      <th className="py-3 pr-4">Segments</th>
                      <th className="py-3 pr-4">Total Fare</th>
                      <th className="py-3">Legs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentEfficiency.items.map((row) => (
                      <tr
                        key={`${row.schedule_id}-${row.coach_id}-${row.seat_number}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-slate-800">
                          {row.train_number ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{row.line_name ?? '—'}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {row.coach_identifier ?? 'Coach'} · Seat {row.seat_number}
                        </td>
                        <td className="py-3 pr-4 text-slate-800">{row.segment_count}</td>
                        <td className="py-3 pr-4 font-semibold text-emerald-700">
                          {formatCurrency(row.total_fare_collected)}
                        </td>
                        <td className="py-3 text-slate-500">
                          {row.segments
                            .map((seg) => `${seg.origin_station} → ${seg.destination_station}`)
                            .join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">
                No multi-segment seats found for the selected filters.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
