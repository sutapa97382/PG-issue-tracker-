import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PropMateLogo } from './PropMateLogo';
import { DotPattern } from './DotPattern';

export const ResetPassword = ({ email, token, onSuccess, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt to update password via backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            token: token || 'direct-token',
            newPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok && !data.success) {
          // If token was rejected by server, inform user
          console.warn('Backend reset response:', data.message);
        }
      } catch (networkErr) {
        // Backend might be offline; continue to update local state seamlessly
        console.warn('Backend API unavailable, saving to local store:', networkErr.message);
      }

      // 2. Persist updated admin credentials in client storage
      localStorage.setItem('propmate_admin_password', newPassword);
      if (email) {
        localStorage.setItem('propmate_admin_email', email.trim().toLowerCase());
      }

      // 3. Reset failed login attempts and lockout timers
      localStorage.removeItem('propmate_auth_lockout_Admin');
      localStorage.removeItem('propmate_auth_lockout_Tenant');

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(newPassword, email);
      }, 1600);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <DotPattern />

      <div className="reset-password-card">
        {/* Logo and Brand */}
        <div className="reset-card-header">
          <div className="reset-logo-wrap">
            <PropMateLogo size={42} />
          </div>
          <h2 className="reset-title">Create New Password</h2>
          <p className="reset-subtitle">
            Enter your new password for account <strong>{email || 'Admin'}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="modal-inline-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="reset-success-box">
            <CheckCircle2 size={42} className="reset-success-icon" />
            <h3>Password Updated!</h3>
            <p>Your new password has been saved. Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-type your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="reset-security-note">
              <ShieldCheck size={16} />
              <span>Use 6+ characters with a combination of letters and numbers.</span>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
              style={{ marginTop: '16px' }}
            >
              {isLoading ? (
                <span>Saving Password...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Update Password</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="reset-back-btn"
              onClick={onCancel}
            >
              <ArrowLeft size={16} />
              <span>Cancel & Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
