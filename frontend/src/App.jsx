import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Shield, User, Key, X } from 'lucide-react';
import { PropMateLogo } from './components/PropMateLogo';
import { BuildingIllustration } from './components/BuildingIllustration';
import { DotPattern } from './components/DotPattern';
import { AdminSignup } from './components/AdminSignup';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import './App.css';

const SESSION_COOKIE_NAME = 'propmate_auth_session';
const SESSION_DURATION_HOURS = 2;

// Set 2-hour cookie and localStorage
const setAuthSession = (sessionData, hours = SESSION_DURATION_HOURS) => {
  const expiresAt = Date.now() + hours * 60 * 60 * 1000;
  const payload = { ...sessionData, expiresAt };
  try {
    const jsonStr = JSON.stringify(payload);
    const maxAgeSeconds = hours * 60 * 60;
    // Set cookie valid for 2 hours
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(jsonStr)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    // Dual storage in localStorage for resilience
    localStorage.setItem(SESSION_COOKIE_NAME, jsonStr);
  } catch (err) {
    console.error('Failed to set auth session:', err);
  }
};

// Retrieve and validate auth session
const getAuthSession = () => {
  try {
    let rawData = null;
    // 1. Check localStorage first (fastest, synchronous)
    rawData = localStorage.getItem(SESSION_COOKIE_NAME);

    // 2. Fallback to cookies
    if (!rawData) {
      const cookies = document.cookie.split(';');
      for (let c of cookies) {
        const trimmed = c.trim();
        if (trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) {
          rawData = decodeURIComponent(trimmed.substring(SESSION_COOKIE_NAME.length + 1));
          break;
        }
      }
    }

    if (!rawData) return null;

    const session = JSON.parse(rawData);
    // Check if session is within the 2-hour validity window
    if (session && session.expiresAt && Date.now() < session.expiresAt) {
      if (session.role === 'Admin') {
        if (!session.name || /sutapamaity\d*/i.test(session.name)) {
          session.name = 'Sutapa';
        }
      }
      return session;
    }

    // Expired
    clearAuthSession();
    return null;
  } catch (err) {
    console.error('Failed to parse auth session:', err);
    return null;
  }
};

// Clear auth session (on logout or expiry)
const clearAuthSession = () => {
  try {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    localStorage.removeItem(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
};

// --------------------------------------------------------------------------
// Rate Limiting: 5 Failed Attempts -> 15-Minute Lockout Helper
// --------------------------------------------------------------------------
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getLockoutInfo = (roleKey) => {
  try {
    const raw = localStorage.getItem(`propmate_lockout_${roleKey.toLowerCase()}`);
    if (!raw) return { attempts: 0, isLocked: false, remainingSeconds: 0 };
    const data = JSON.parse(raw);
    if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
      const remainingSeconds = Math.max(1, Math.ceil((data.lockoutUntil - Date.now()) / 1000));
      return { attempts: data.attempts || MAX_FAILED_ATTEMPTS, isLocked: true, remainingSeconds };
    }
    // Expired lockout
    if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
      localStorage.removeItem(`propmate_lockout_${roleKey.toLowerCase()}`);
    }
    return { attempts: data.attempts || 0, isLocked: false, remainingSeconds: 0 };
  } catch (e) {
    return { attempts: 0, isLocked: false, remainingSeconds: 0 };
  }
};

const recordFailedAttempt = (roleKey) => {
  try {
    const key = `propmate_lockout_${roleKey.toLowerCase()}`;
    const current = getLockoutInfo(roleKey);
    const newAttempts = current.attempts + 1;
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(key, JSON.stringify({ attempts: newAttempts, lockoutUntil }));
      return { attempts: newAttempts, isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
    } else {
      localStorage.setItem(key, JSON.stringify({ attempts: newAttempts, lockoutUntil: null }));
      return { attempts: newAttempts, isLocked: false, remainingSeconds: 0 };
    }
  } catch (e) {
    return { attempts: 1, isLocked: false, remainingSeconds: 0 };
  }
};

const resetFailedAttempts = (roleKey) => {
  try {
    localStorage.removeItem(`propmate_lockout_${roleKey.toLowerCase()}`);
  } catch (e) {}
};

const formatRemainingTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  return `${secs}s`;
};

export default function App() {
  const initialSession = getAuthSession();
  const [currentPage, setCurrentPage] = useState(() => initialSession?.currentPage || 'login'); // 'login' | 'admin-signup' | 'admin-dashboard' | 'user-dashboard'
  const [currentTenant, setCurrentTenant] = useState(() => initialSession?.currentTenant || null);
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    if (initialSession?.role === 'Admin') {
      let name = initialSession.name || localStorage.getItem('propmate_admin_name');
      if (!name || /sutapamaity\d*/i.test(name)) name = 'Sutapa';
      return {
        name,
        email: initialSession.email || ''
      };
    }
    const storedName = localStorage.getItem('propmate_admin_name');
    return { name: storedName && !/sutapamaity\d*/i.test(storedName) ? storedName : 'Sutapa' };
  });
  const [role, setRole] = useState(() => initialSession?.role || 'Tenant'); // 'Tenant' | 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'signup' | 'forgot' | 'contact' | null
  const [lockoutRemaining, setLockoutRemaining] = useState(() => getLockoutInfo(initialSession?.role || 'Tenant').remainingSeconds);

  // Live timer for 15-minute lockout countdown (updates every second)
  useEffect(() => {
    const checkLockout = () => {
      const info = getLockoutInfo(role);
      if (info.isLocked) {
        setLockoutRemaining(info.remainingSeconds);
        // Live update the countdown in the status message banner every second
        setStatusMessage((prev) => {
          if (prev && prev.isLockout) {
            return {
              type: 'error',
              isLockout: true,
              text: `Too many failed attempts (5/5). Account locked for security. Please try again after 15 minutes (Retry in ${formatRemainingTime(info.remainingSeconds)}).`,
            };
          }
          return prev;
        });
      } else {
        setLockoutRemaining(0);
        setStatusMessage((prev) => {
          if (prev && prev.isLockout) {
            return {
              type: 'success',
              isLockout: false,
              text: '15-minute security lock has expired. You may now attempt to log in.',
            };
          }
          return prev;
        });
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [role]);

  // Auto-logout when 2 hours have expired
  useEffect(() => {
    const checkExpiry = () => {
      const session = getAuthSession();
      if (!session && (currentPage === 'user-dashboard' || currentPage === 'admin-dashboard')) {
        clearAuthSession();
        setCurrentPage('login');
        setCurrentTenant(null);
        setStatusMessage({
          type: 'error',
          text: 'Session expired after 2 hours. Please log in again.'
        });
      }
    };

    const timer = setInterval(checkExpiry, 30000);
    return () => clearInterval(timer);
  }, [currentPage]);

  // Role descriptions & demo logins
  const roleInfo = {
    Tenant: {
      placeholderEmail: 'tenant@propmate.com',
      badge: 'Tenant Portal',
      desc: 'Access your lease, pay rent & submit maintenance tickets.',
      icon: <User size={16} />
    },
    Admin: {
      placeholderEmail: 'admin@propmate.com',
      badge: 'Admin Console',
      desc: 'Manage units, approve requests, monitor finances & staff.',
      icon: <Shield size={16} />
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    const info = getLockoutInfo(selectedRole);
    if (info.isLocked) {
      setLockoutRemaining(info.remainingSeconds);
      setStatusMessage({
        type: 'error',
        isLockout: true,
        text: `Too many failed attempts (5/5). Account locked for security. Please try again after 15 minutes (Retry in ${formatRemainingTime(info.remainingSeconds)}).`
      });
    } else {
      setLockoutRemaining(0);
      setStatusMessage(null);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if currently locked out
    const lockout = getLockoutInfo(role);
    if (lockout.isLocked) {
      setLockoutRemaining(lockout.remainingSeconds);
      setStatusMessage({
        type: 'error',
        isLockout: true,
        text: `Too many failed attempts (5/5). Account locked for security. Please try again after 15 minutes (Retry in ${formatRemainingTime(lockout.remainingSeconds)}).`
      });
      return;
    }

    if (role === 'Tenant') {
      const cleanKey = secretKey.trim().toUpperCase();
      if (!cleanKey) {
        setStatusMessage({ type: 'error', text: 'Please enter your secret key' });
        return;
      }

      // Check against rooms saved in localStorage
      let rooms = [];
      try {
        rooms = JSON.parse(localStorage.getItem('propmate_rooms_v2') || '[]');
      } catch (err) {
        rooms = [];
      }

      const matchedRoom = rooms.find(
        (r) => r.secretKey && r.secretKey.trim().toUpperCase() === cleanKey
      );

      // Strict validation: Only allow login if this secret key was created by Admin
      if (!matchedRoom) {
        const attemptResult = recordFailedAttempt('Tenant');
        if (attemptResult.isLocked) {
          setLockoutRemaining(attemptResult.remainingSeconds);
          setStatusMessage({
            type: 'error',
            isLockout: true,
            text: `Too many failed attempts (5/5). Wrong secret key entered 5 times. Account locked for security. Please try again after 15 minutes (Retry in ${formatRemainingTime(attemptResult.remainingSeconds)}).`
          });
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - attemptResult.attempts;
          if (rooms.length === 0) {
            setStatusMessage({
              type: 'error',
              text: `No rooms registered yet. (${attemptResult.attempts}/5 failed attempts. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15 mins lockout).`
            });
          } else {
            setStatusMessage({
              type: 'error',
              text: `Invalid Secret Key. (${attemptResult.attempts}/5 failed attempts. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15 mins lockout).`
            });
          }
        }
        return;
      }

      // Successful login - reset failed attempts
      resetFailedAttempts('Tenant');
      setLockoutRemaining(0);

      // Save 2-hour session cookie
      setAuthSession({
        role: 'Tenant',
        currentPage: 'user-dashboard',
        currentTenant: matchedRoom
      }, 2);

      setCurrentTenant(matchedRoom);
      setStatusMessage(null);
      setCurrentPage('user-dashboard');
      return;
    } else {
      if (!email.trim()) {
        setStatusMessage({ type: 'error', text: 'Please enter your email address' });
        return;
      }
      if (!password) {
        setStatusMessage({ type: 'error', text: 'Please enter your password' });
        return;
      }

      // Password validation for Admin
      const storedPassword = localStorage.getItem('propmate_admin_password') || 'admin123';
      if (password !== storedPassword) {
        const attemptResult = recordFailedAttempt('Admin');
        if (attemptResult.isLocked) {
          setLockoutRemaining(attemptResult.remainingSeconds);
          setStatusMessage({
            type: 'error',
            isLockout: true,
            text: `Too many failed attempts (5/5). Wrong password entered 5 times. Account locked for security. Please try again after 15 minutes (Retry in ${formatRemainingTime(attemptResult.remainingSeconds)}).`
          });
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - attemptResult.attempts;
          setStatusMessage({
            type: 'error',
            text: `Password is wrong. (${attemptResult.attempts}/5 failed attempts. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15 mins lockout).`
          });
        }
        return;
      }

      // Successful login - reset failed attempts
      resetFailedAttempts('Admin');
      setLockoutRemaining(0);
    }

    if (role === 'Admin') {
      const cleanEmail = email.trim();
      const storedName = localStorage.getItem('propmate_admin_name');
      let adminName = storedName;
      if (!adminName || /sutapamaity\d*/i.test(adminName)) {
        if (/^sutapa/i.test(cleanEmail)) {
          adminName = 'Sutapa';
        } else if (cleanEmail) {
          let prefix = cleanEmail.split('@')[0].replace(/\d+$/, '');
          adminName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      }
      if (!adminName) adminName = 'Sutapa';

      // Persist clean name in localStorage
      localStorage.setItem('propmate_admin_name', adminName);

      const adminObj = {
        name: adminName,
        email: cleanEmail
      };

      // Save 2-hour session cookie
      setAuthSession({
        role: 'Admin',
        currentPage: 'admin-dashboard',
        email: cleanEmail,
        name: adminName
      }, 2);

      setCurrentAdmin(adminObj);
      setStatusMessage(null);
      setCurrentPage('admin-dashboard');
      return;
    }
  };

  return (
    <>
      {currentPage === 'user-dashboard' ? (
        <UserDashboard
          tenantInfo={currentTenant}
          onLogout={() => {
            clearAuthSession();
            setCurrentPage('login');
            setCurrentTenant(null);
            setSecretKey('');
          }}
        />
      ) : currentPage === 'admin-dashboard' ? (
        <AdminDashboard
          adminInfo={currentAdmin}
          onLogout={() => {
            clearAuthSession();
            setCurrentPage('login');
            setCurrentAdmin(null);
          }}
        />
      ) : currentPage === 'admin-signup' ? (
        <AdminSignup
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      ) : (
        <div className="login-page-container">
          {/* LEFT SECTION (Dark Navy Hero) */}
          <section className="hero-section">
            {/* Halftone dot pattern bottom left */}
            <DotPattern />

            {/* Top Logo */}
            <div className="hero-header">
              <PropMateLogo />
            </div>

            {/* Center Illustration */}
            <div className="hero-center-art">
              <BuildingIllustration />
            </div>

            {/* Bottom Hero Text */}
            <div className="hero-footer-text">
              <h1 className="hero-title">360° Property Management</h1>
              <p className="hero-subtitle">
                Manage properties, tenants & teams — all in one place.
              </p>
            </div>
          </section>

          {/* RIGHT SECTION (Light Login Form) */}
          <section className="form-section">
            <div className="form-wrapper">
              {/* Main White Card */}
              <div className="login-card">
                {/* Heading */}
                <div className="card-header">
                  <h2 className="card-title">Welcome Back</h2>
                  <p className="card-subtitle">
                    {role === 'Tenant'
                      ? 'Please enter your secret key to continue to your account'
                      : 'Please sign in to continue to your account'}
                  </p>
                </div>

                {/* Notification / Toast */}
                {statusMessage && (
                  <div className={`status-banner ${statusMessage.type}`}>
                    {statusMessage.type === 'success' && <CheckCircle2 size={18} className="status-icon" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="auth-form" noValidate>

                  {/* Conditional Inputs: Tenant (Secret Key only) vs Admin (Email & Password) */}
                  {role === 'Tenant' ? (
                    /* Secret Key Only Field for Tenant */
                    <div className="input-group">
                      <label htmlFor="secretKey" className="input-label">Secret Key</label>
                      <div className="input-field-wrapper">
                        <Key className="field-icon-left" size={18} />
                        <input
                          id="secretKey"
                          type={showSecretKey ? 'text' : 'password'}
                          className="form-input password-input"
                          placeholder="Enter secret key"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          required
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          aria-label={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                          title={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                        >
                          {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Email Input for Admin */}
                      <div className="input-group">
                        <label htmlFor="email" className="input-label">Email</label>
                        <div className="input-field-wrapper">
                          <Mail className="field-icon-left" size={18} />
                          <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Password Input for Admin */}
                      <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <div className="input-field-wrapper">
                          <Lock className="field-icon-left" size={18} />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-input password-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Role Selection */}
                  <div className="role-group">
                    <label className="input-label">Role</label>
                    <div className="role-pills-container" role="radiogroup" aria-label="Select user role">
                      {(['Tenant', 'Admin']).map((r) => {
                        const isSelected = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`role-pill-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => handleRoleChange(r)}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="btn-spinner-label">
                        <span className="spinner"></span> Signing in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>

                  {/* Footer Links */}
                  <div className="card-footer-links">
                    {role === 'Admin' ? (
                      <>
                        <p className="signup-prompt">
                          Don't have an account? ' <button
                            type="button"
                            className="inline-link"
                            onClick={() => setCurrentPage('admin-signup')}
                          >
                            Sign Up
                          </button>
                        </p>

                        {/* Forgot Password Link */}
                        <button
                          type="button"
                          className="forgot-password-link"
                          onClick={() => setShowModal('forgot')}
                        >
                          Forgot password?
                        </button>
                      </>
                    ) : (
                      <>
                        {/* For Tenant: No sign up, only assistance to retrieve secret key */}
                        <button
                          type="button"
                          className="forgot-password-link"
                          onClick={() => setShowModal('contact')}
                        >
                          Forgot secret key?
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Interactive Modal Dialog */}
          {showModal && (
            <div className="modal-backdrop" onClick={() => setShowModal(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowModal(null)} aria-label="Close modal">
                  <X size={20} />
                </button>

                {showModal === 'forgot' && (
                  <div className="modal-body">
                    <h3>Reset Password</h3>
                    <p>Enter your email to receive recovery instructions for your <strong>{role}</strong> account.</p>
                    <input
                      type="email"
                      className="form-input modal-input"
                      placeholder="you@company.com"
                      defaultValue={email}
                    />
                    <button
                      className="login-submit-btn modal-action"
                      onClick={() => {
                        setShowModal(null);
                        setStatusMessage({
                          type: 'success',
                          text: 'Password reset link has been dispatched to your email.'
                        });
                      }}
                    >
                      Send Reset Link
                    </button>
                  </div>
                )}
                {showModal === 'contact' && (
                  <div className="modal-body">
                    <h3>Contact Property Manager</h3>
                    <p>Need access or your invite link resent? Connect with building administration:</p>
                    <div className="contact-card">
                      <p><strong>Support Desk:</strong> support@propmate360.com</p>
                      <p><strong>Leasing Office:</strong> (555) 360-PROP</p>
                      <p><strong>Hours:</strong> Mon - Sat: 8:00 AM - 7:00 PM</p>
                    </div>
                    <button className="login-submit-btn modal-action" onClick={() => setShowModal(null)}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
