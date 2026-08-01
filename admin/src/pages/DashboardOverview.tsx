import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck, ArrowRight, Train, Ticket, BarChart3, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Dashboard Welcome Header */}
      <div className="dashboard-heading">
        <h1>Welcome, {user?.name || user?.email?.split('@')[0] || 'Admin'}</h1>
        <p>Select an administration module below to manage system configurations & operations.</p>
      </div>

      {/* Option Cards Grid - Portrait 3 per row */}
      <div className="option-cards-grid">
        {/* Admin Management Card (Active Link) */}
        <Link to="/dashboard/admin-management" className="option-card-link">
          <div className="option-card interactive">
            <div>
              <div className="card-top">
                <div className="card-icon-box">
                  <ShieldCheck style={{ width: 28, height: 28 }} />
                </div>
                <span className="status-badge status-active">Active</span>
              </div>
              <h2 className="card-title">Admin Management</h2>
              <p className="card-desc">
                Configure system administrator credentials, manage user roles, and audit access permissions across the system.
              </p>
            </div>
            <div className="card-footer-action">
              <span>Open Module</span>
              <ArrowRight style={{ width: 18, height: 18 }} />
            </div>
          </div>
        </Link>

        {/* Additional Option Cards (Offline / Future Modules) */}
        <div className="option-card disabled">
          <div>
            <div className="card-top">
              <div className="card-icon-box" style={{ background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>
                <Train style={{ width: 28, height: 28 }} />
              </div>
              <span className="status-badge status-offline">Offline</span>
            </div>
            <h2 className="card-title">Train Schedules</h2>
            <p className="card-desc">
              Manage train routes, departure & arrival timetables, line stops, and coach allocations.
            </p>
          </div>
          <div className="card-footer-action" style={{ color: '#94a3b8' }}>
            <span>Module Offline</span>
          </div>
        </div>

        <div className="option-card disabled">
          <div>
            <div className="card-top">
              <div className="card-icon-box" style={{ background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>
                <Ticket style={{ width: 28, height: 28 }} />
              </div>
              <span className="status-badge status-offline">Offline</span>
            </div>
            <h2 className="card-title">Seat Bookings</h2>
            <p className="card-desc">
              View passenger seat reservations, temporary seat holds, fare calculations, and booking logs.
            </p>
          </div>
          <div className="card-footer-action" style={{ color: '#94a3b8' }}>
            <span>Module Offline</span>
          </div>
        </div>

        <div className="option-card disabled">
          <div>
            <div className="card-top">
              <div className="card-icon-box" style={{ background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>
                <Users style={{ width: 28, height: 28 }} />
              </div>
              <span className="status-badge status-offline">Offline</span>
            </div>
            <h2 className="card-title">Passenger Directory</h2>
            <p className="card-desc">
              Manage registered passenger accounts, NIC verification status, and booking history.
            </p>
          </div>
          <div className="card-footer-action" style={{ color: '#94a3b8' }}>
            <span>Module Offline</span>
          </div>
        </div>

        <div className="option-card disabled">
          <div>
            <div className="card-top">
              <div className="card-icon-box" style={{ background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>
                <BarChart3 style={{ width: 28, height: 28 }} />
              </div>
              <span className="status-badge status-offline">Offline</span>
            </div>
            <h2 className="card-title">Analytics & Reports</h2>
            <p className="card-desc">
              Generate daily occupancy charts, ticket revenue analytics, and system audit logs.
            </p>
          </div>
          <div className="card-footer-action" style={{ color: '#94a3b8' }}>
            <span>Module Offline</span>
          </div>
        </div>

        <div className="option-card disabled">
          <div>
            <div className="card-top">
              <div className="card-icon-box" style={{ background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>
                <Settings style={{ width: 28, height: 28 }} />
              </div>
              <span className="status-badge status-offline">Offline</span>
            </div>
            <h2 className="card-title">System Settings</h2>
            <p className="card-desc">
              Configure system parameters, fare rate multipliers, CORS origins, and API credentials.
            </p>
          </div>
          <div className="card-footer-action" style={{ color: '#94a3b8' }}>
            <span>Module Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
