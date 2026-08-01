import React from 'react';
import { Link } from 'react-router';
import { ChevronRight, Shield, UserPlus, Search, CheckCircle, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminManagement: React.FC = () => {
  const { user } = useAuth();

  // Mock list of admins
  const admins = [
    {
      id: 'usr-1',
      name: user?.name || 'Chief System Administrator',
      email: user?.email || 'admin@railway.gov.lk',
      role: 'SUPER_ADMIN',
      status: 'Active',
      created: '2026-01-15',
    },
    {
      id: 'usr-2',
      name: 'Operations Manager',
      email: 'ops@railway.gov.lk',
      role: 'ADMIN',
      status: 'Active',
      created: '2026-02-01',
    },
    {
      id: 'usr-3',
      name: 'Station Controller Colombo',
      email: 'station.colombo@railway.gov.lk',
      role: 'ADMIN',
      status: 'Active',
      created: '2026-03-10',
    },
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/dashboard" className="breadcrumb-link">
          Dashboard
        </Link>
        <ChevronRight style={{ width: 14, height: 14 }} />
        <span>Admin Management</span>
      </nav>

      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Admin Management
          </h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            Manage authorized system administrators, roles, and security credentials.
          </p>
        </div>

        <button className="action-btn-primary">
          <UserPlus style={{ width: 18, height: 18 }} />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="table-card">
        {/* Search Bar */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="input-field-wrapper" style={{ maxWidth: '360px', width: '100%' }}>
            <Search className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search admin by name or email..."
              style={{ backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        {/* Admin List Table */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Admin User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <Mail style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                    <span>{item.email}</span>
                  </div>
                </td>
                <td>
                  <span className="user-badge" style={{ display: 'inline-flex', padding: '0.2rem 0.6rem' }}>
                    <Shield style={{ width: 13, height: 13, color: '#4f46e5' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.role}</span>
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge status-active"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <CheckCircle style={{ width: 12, height: 12 }} />
                    <span>{item.status}</span>
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    <Calendar style={{ width: 14, height: 14 }} />
                    <span>{item.created}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
