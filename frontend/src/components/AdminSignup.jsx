import React, { useState } from 'react';
import { Mail, Phone, Lock, Eye, EyeOff, Shield, Info, BarChart3, CheckCircle2 } from 'lucide-react';
import { HexagonLogo } from './HexagonLogo';
import { ComplexIllustration } from './ComplexIllustration';

export const AdminSignup = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    propertyCount: '6–20',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your full name' });
      return;
    }
    if (!formData.email.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    if (!formData.password) {
      setStatusMessage({ type: 'error', text: 'Please enter a password' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (!formData.agreeTerms) {
      setStatusMessage({ type: 'error', text: 'Please agree to the Terms of Service' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    localStorage.setItem('propmate_admin_name', formData.fullName.trim());
    localStorage.setItem('propmate_admin_email', formData.email.trim().toLowerCase());
    localStorage.setItem('propmate_admin_password', formData.password);

    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage({
        type: 'success',
        text: 'Admin account created successfully! Redirecting...'
      });
      setTimeout(() => {
        onNavigateToLogin();
      }, 700);
    }, 800);
  };

  return (
    <div className="login-page-container admin-signup-layout">
      {/* LEFT SECTION (Dark Navy Hero) */}
      <section className="hero-section admin-hero">
        {/* Top Logo */}
        <div className="hero-header">
          <HexagonLogo />
        </div>

        {/* Center Isometric Complex Illustration */}
        <div className="hero-center-art complex-art-wrapper">
          <ComplexIllustration />
        </div>

        {/* Bottom Hero Text & Trust Badges */}
        <div className="hero-footer-text admin-footer-text">
          <h1 className="hero-title admin-title">
            360° Property Management <br />
            <span className="cyan-highlight">— Own Your Properties</span>
          </h1>

          {/* Three Trust Badges */}
          <div className="trust-badges-row">
            <div className="trust-badge">
              <Shield size={14} className="badge-icon" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="trust-badge">
              <Lock size={14} className="badge-icon" />
              <span>Enterprise Secure</span>
            </div>
            <div className="trust-badge">
              <BarChart3 size={14} className="badge-icon" />
              <span>Real-time Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SECTION (Admin Signup Card) */}
      <section className="form-section admin-form-section">
        <div className="form-wrapper admin-card-wrapper">
          <div className="login-card admin-signup-card">
            {/* Card Header */}
            <div className="card-header">
              <h2 className="card-title">Create Admin Account</h2>
              <p className="card-subtitle">Property Owner / Manager Registration</p>
            </div>

            {/* Notification / Toast */}
            {statusMessage && (
              <div className={`status-banner ${statusMessage.type}`}>
                {statusMessage.type === 'success' && <CheckCircle2 size={18} className="status-icon" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form admin-auth-form" noValidate>
              {/* Full Name */}
              <div className="input-group">
                <label htmlFor="fullName" className="input-label">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-input text-only-input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Company / Property Name */}
              <div className="input-group">
                <label htmlFor="companyName" className="input-label">Company / Property Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  className="form-input text-only-input"
                  placeholder="Acme Properties LLC"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              {/* Email Address */}
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email Address</label>
                <div className="input-field-wrapper">
                  <Mail className="field-icon-left" size={17} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="input-group">
                <label htmlFor="phone" className="input-label">Phone Number</label>
                <div className="input-field-wrapper">
                  <Phone className="field-icon-left" size={17} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label htmlFor="password" className="input-label">Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input password-input text-only-input-left"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input password-input text-only-input-left"
                    placeholder="••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>


              {/* Property Count Dropdown */}
              <div className="input-group">
                <label htmlFor="propertyCount" className="input-label">Property Count</label>
                <div className="select-wrapper">
                  <select
                    id="propertyCount"
                    name="propertyCount"
                    className="form-input form-select"
                    value={formData.propertyCount}
                    onChange={handleChange}
                  >
                    <option value="1–5">1–5</option>
                    <option value="6–20">6–20</option>
                    <option value="21–50">21–50</option>
                    <option value="50+">50+</option>
                  </select>
                  <div className="select-chevron">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="checkbox-row">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  className="custom-checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms" className="checkbox-label">
                  I agree to the <a href="#terms" className="inline-link-bold">Terms of Service</a> and <a href="#privacy" className="inline-link-bold">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`login-submit-btn admin-submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-spinner-label">
                    <span className="spinner"></span> Creating account...
                  </span>
                ) : (
                  'Create Admin Account'
                )}
              </button>

              {/* Footer Links */}
              <div className="admin-footer-links">
                <p className="footer-link-row">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="inline-action-link"
                    onClick={onNavigateToLogin}
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
