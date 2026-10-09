import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Shield, User, Key, X } from 'lucide-react';
import { PropMateLogo } from './components/PropMateLogo';
import { BuildingIllustration } from './components/BuildingIllustration';
import { DotPattern } from './components/DotPattern';
import { AdminSignup } from './components/AdminSignup';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'admin-signup' | 'admin-dashboard' | 'user-dashboard'
  const [currentTenant, setCurrentTenant] = useState(null);
  const [role, setRole] = useState('Tenant'); // 'Tenant' | 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'signup' | 'forgot' | 'contact' | null

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
    setStatusMessage(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
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

      // Validate secret key
      if (!matchedRoom && !cleanKey.startsWith('ROOM-') && cleanKey.length < 5) {
        setStatusMessage({
          type: 'error',
          text: 'Invalid Secret Key. Please check the secret key provided by your admin.'
        });
        return;
      }

      const tenantData = matchedRoom || {
        tenant: 'Tenant User',
        room: cleanKey.includes('-') ? cleanKey.split('-')[1] : 'Room 101',
        secretKey: cleanKey
      };

      setCurrentTenant(tenantData);
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
        setStatusMessage({ type: 'error', text: 'Password is wrong. Please enter the correct password.' });
        return;
      }
    }

    if (role === 'Admin') {
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
            setCurrentPage('login');
            setCurrentTenant(null);
          }}
        />
      ) : currentPage === 'admin-dashboard' ? (
        <AdminDashboard onLogout={() => setCurrentPage('login')} />
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
