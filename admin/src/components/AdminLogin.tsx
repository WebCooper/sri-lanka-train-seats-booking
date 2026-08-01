import React, { useState } from 'react';
import { 
  Train, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        email: email.trim(),
        password: password.trim(),
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed.');
      } else {
        setSuccessMessage('Authentication successful! Accessing admin portal...');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected authentication error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-backdrop">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="grid-overlay" />
      </div>

      <div className="login-card-container">
        <div className="login-card">
          {/* Header */}
          <div className="brand-header">
            <div className="logo-badge">
              <Train className="logo-icon" />
            </div>
            <div className="brand-titles">
              <span className="brand-tag">SRI LANKA RAILWAYS</span>
              <h1 className="login-title">Admin Management Portal</h1>
              <p className="login-subtitle">
                Enter your credentials to manage train schedules, bookings & passenger seats.
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="alert alert-error" role="alert">
              <AlertCircle className="alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" role="alert">
              <CheckCircle2 className="alert-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Admin Email Address
              </label>
              <div className="input-field-wrapper">
                <Mail className="input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@railway.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="admin-password" className="form-label">
                  Password
                </label>
              </div>
              <div className="input-field-wrapper">
                <Lock className="input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="eye-icon" />
                  ) : (
                    <Eye className="eye-icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner-icon" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="login-footer">
            <div className="security-badge">
              <ShieldCheck className="security-icon" />
              <span>Restricted System • Authorized Staff Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
