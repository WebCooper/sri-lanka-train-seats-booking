import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Train, Shield, LogOut } from 'lucide-react';
import { Link, Outlet } from 'react-router';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Navbar Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-3 no-underline group">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
            <Train className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 leading-tight">
              Sri Lanka Railways
            </div>
            <div className="text-xs font-medium text-slate-500">
              Admin Control Portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user?.email || 'admin@railway.gov.lk'}</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
              ADMIN
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
};
