import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Train, Shield, LogOut } from 'lucide-react';
import { Link, Outlet } from 'react-router';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      {/* Navigation Header */}
      <header className="navbar">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Train style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div className="navbar-title">Sri Lanka Railways</div>
            <div className="navbar-subtitle">Admin Control Portal</div>
          </div>
        </Link>

        <div className="navbar-user">
          <div className="user-badge">
            <Shield style={{ width: 15, height: 15, color: '#059669' }} />
            <span>{user?.email || 'admin@railway.gov.lk'}</span>
            <span className="role-pill">ADMIN</span>
          </div>

          <button onClick={logout} className="logout-btn" title="Sign out of Admin Portal">
            <LogOut style={{ width: 15, height: 15 }} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="dashboard-content-area">
        <Outlet />
      </main>
    </div>
  );
};
