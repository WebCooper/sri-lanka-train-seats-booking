import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck, ArrowRight, Train, Calendar, BarChart3, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Dashboard Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Welcome, {user?.name || user?.email?.split('@')[0] || 'Admin'}
        </h1>
        <p className="text-sm text-slate-500">
          Select an administration module below to manage system configurations & operations.
        </p>
      </div>

      {/* Option Cards Grid - Portrait 3 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {/* Admin Management Card (Active Link) */}
        <Link to="/dashboard/admin-management" className="no-underline flex h-full group">
          <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-200 hover:-translate-y-1">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                Admin Management
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Configure system administrator credentials, manage user roles, and audit access permissions across the system.
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>Open Module</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Train & Line Management Card (Active Link) */}
        <Link to="/dashboard/train-management" className="no-underline flex h-full group">
          <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 transition-all duration-200 hover:-translate-y-1">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-md shadow-sky-500/10">
                  <Train className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-sky-600 transition-colors">
                Train & Line Management
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Configure railway line routes, manage train fleets, assign route lines, and set coach seat reservations.
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-sky-600 group-hover:text-sky-700">
              <span>Open Module</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Train Calendar & Schedule Management Card (Active Link) */}
        <Link to="/dashboard/schedule-management" className="no-underline flex h-full group">
          <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-200 hover:-translate-y-1">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-md shadow-purple-500/10">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-purple-600 transition-colors">
                Train Calendar & Schedules
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Create train departure timetables, schedule train sessions along line routes, set departure & arrival times, and manage operational calendars.
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
              <span>Open Module</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Additional Option Cards (Offline Modules) */}
        <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl opacity-75 cursor-not-allowed">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/60 text-slate-500 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-600">
                Offline
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2.5">
              Passenger Directory
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Manage registered passenger accounts, NIC verification status, and booking history.
            </p>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-200/60 text-sm font-semibold text-slate-400">
            <span>Module Offline</span>
          </div>
        </div>

        <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl opacity-75 cursor-not-allowed">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/60 text-slate-500 flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-600">
                Offline
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2.5">
              Analytics & Reports
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Generate daily occupancy charts, ticket revenue analytics, and system audit logs.
            </p>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-200/60 text-sm font-semibold text-slate-400">
            <span>Module Offline</span>
          </div>
        </div>

        <div className="w-full min-h-[330px] flex flex-col justify-between p-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl opacity-75 cursor-not-allowed">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/60 text-slate-500 flex items-center justify-center">
                <Settings className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-600">
                Offline
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2.5">
              System Settings
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Configure system parameters, fare rate multipliers, CORS origins, and API credentials.
            </p>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-200/60 text-slate-400">
            <span>Module Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
