import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { AdminManagement } from './pages/AdminManagement';
import { TrainManagement } from './pages/TrainManagement';
import { ScheduleManagement } from './pages/ScheduleManagement';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import './index.css';

// Guard for protected routes: requires authenticated admin user
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="login-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <Loader2 className="spinner-icon" style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} />
          <span>Verifying admin authentication session...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Guard for public routes: redirects to dashboard if already logged in as admin
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="login-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <Loader2 className="spinner-icon" style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} />
          <span>Verifying admin authentication session...</span>
        </div>
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
            },
          }}
        />

        <Routes>
          {/* Public Login Route */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AdminLogin />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="train-management" element={<TrainManagement />} />
            <Route path="schedule-management" element={<ScheduleManagement />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
