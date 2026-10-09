import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ClipboardList,
  LogOut,
  Building2,
  Key,
  User,
  Wrench,
  Zap,
  Sparkles,
  Wind,
  CheckCircle,
  Clock,
  Shield,
  Plus,
  Send,
  HelpCircle,
  ChevronRight,
  X
} from 'lucide-react';
import './AdminDashboard.css';

// Helper for category icons matching tracker theme
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Electrical':
      return <Zap size={15} className="cat-icon electrical" />;
    case 'Cleaning':
      return <Sparkles size={15} className="cat-icon cleaning" />;
    case 'HVAC':
      return <Wind size={15} className="cat-icon hvac" />;
    default:
      return <Wrench size={15} className="cat-icon plumbing" />;
  }
};

export const UserDashboard = ({ tenantInfo, onLogout }) => {
  // Active sidebar tab: 'Report problem' | 'My problem'
  const [activeTab, setActiveTab] = useState('Report problem');
  const [toastMessage, setToastMessage] = useState(null);
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);

  // Tenant profile details (fallback if not provided)
  const tenantName = tenantInfo?.tenant || tenantInfo?.name || 'Tenant User';
  const tenantRoom = tenantInfo?.room || 'Room R101';
  const tenantSecretKey = tenantInfo?.secretKey || 'ROOM-KEY-SECURE';

  // Form state for reporting a problem
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'Medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all problems from localStorage (shared with Admin dashboard)
  const [problems, setProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('propmate_problems_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync problems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('propmate_problems_v2', JSON.stringify(problems));
    } catch (e) {
      console.error(e);
    }
  }, [problems]);

  // Filter problems for this tenant's room or tenant name
  const myProblems = problems.filter((p) => {
    if (!p) return false;
    const matchRoom = p.room && tenantRoom && p.room.toUpperCase() === tenantRoom.toUpperCase();
    const matchTenant = p.tenant && tenantName && p.tenant.toLowerCase() === tenantName.toLowerCase();
    return matchRoom || matchTenant;
  });

  // Problem stats
  const totalMyProblems = myProblems.length;
  const inProgressCount = myProblems.filter((p) => p.status === 'In Progress' || p.status === 'Open').length;
  const resolvedCount = myProblems.filter((p) => p.status === 'Resolved').length;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProblemForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitProblemTicket = (title, description, category, priority) => {
    if (!title || !title.trim()) {
      alert('Please provide a brief problem title');
      return;
    }

    setIsSubmitting(true);

    const initials = tenantName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newTicket = {
      id: `PRB-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant: tenantName,
      tenantInitials: initials || 'TU',
      tenantColor: '#3b82f6',
      room: tenantRoom,
      title: title.trim(),
      description: description ? description.trim() : title.trim(),
      category: category || 'Plumbing',
      worker: '— Unassigned',
      workerInitials: null,
      workerColor: null,
      priority: priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    setTimeout(() => {
      const updatedList = [newTicket, ...problems];
      setProblems(updatedList);
      try {
        localStorage.setItem('propmate_problems_v2', JSON.stringify(updatedList));
      } catch (err) {
        console.error(err);
      }
      setProblemForm({
        title: '',
        description: '',
        category: 'Plumbing',
        priority: 'Medium'
      });
      setIsSubmitting(false);
      setShowNewProblemModal(false);
      setToastMessage(`Problem ticket ${newTicket.id} added successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
      setActiveTab('My problem');
    }, 350);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    submitProblemTicket(
      problemForm.title,
      problemForm.description,
      problemForm.category,
      problemForm.priority
    );
  };

  return (
    <div className="admin-dashboard-container">
      {/* =========================================================================
          SIDEBAR (Navy Blue - User Dashboard)
          ========================================================================= */}
      <aside className="dashboard-sidebar">
        {/* Brand Logo & Header */}
        <div className="sidebar-brand-box">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <svg viewBox="0 0 48 48" fill="none" className="sidebar-logo-svg">
                <circle cx="24" cy="24" r="21" stroke="#00E5FF" strokeWidth="2.5" />
                <path d="M 24 6 C 33.94 6 42 14.06 42 24" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                <text x="24" y="27" fill="#38BDF8" fontSize="10" fontWeight="800" textAnchor="middle">360°</text>
                <path d="M 18 36 V 20 L 24 16 L 30 20 V 36" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title">PropMate 360</span>
              <span className="brand-subtitle">TENANT PORTAL</span>
            </div>
          </div>
        </div>

        {/* Tenant Profile Mini Card in Sidebar */}
        <div
          style={{
            margin: '0 8px 18px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0284c7',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              {tenantName[0]?.toUpperCase() || 'T'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tenantName}
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={11} />
                <span>Room {tenantRoom}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu (Report problem & My problem) */}
        <nav className="sidebar-nav">
          {/* Item 1: Report problem */}
          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'Report problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('Report problem')}
          >
            <span className="nav-icon"><AlertCircle size={18} /></span>
            <span className="nav-text">Report problem</span>
            {activeTab === 'Report problem' && <span className="active-dot"></span>}
          </button>

          {/* Item 2: My problem */}
          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'My problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('My problem')}
          >
            <span className="nav-icon"><ClipboardList size={18} /></span>
            <span className="nav-text">My problem</span>
            {totalMyProblems > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: activeTab === 'My problem' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  color: activeTab === 'My problem' ? '#38bdf8' : '#94a3b8',
                  padding: '2px 7px',
                  borderRadius: '12px'
                }}
              >
                {totalMyProblems}
              </span>
            )}
            {activeTab === 'My problem' && totalMyProblems === 0 && <span className="active-dot"></span>}
          </button>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div
          className="sidebar-footer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'stretch',
            padding: '16px 10px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Logout Button in Footer */}
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b',
              padding: '0 4px'
            }}
          >
            <span className="sidebar-version">v2.4.1 Tenant</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
              <Shield size={11} /> Secured
            </span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="dashboard-main-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <span>Tenant Dashboard</span>
            <ChevronRight size={14} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{activeTab}</span>
          </div>

          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="add-room-btn"
              onClick={() => setShowNewProblemModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <Plus size={15} />
              <span>Add Problem</span>
            </button>

            <div className="topbar-profile-box">
              <div className="profile-avatar" style={{ background: '#0284c7' }}>
                {tenantName[0]?.toUpperCase() || 'T'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="profile-name">{tenantName}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{tenantRoom}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Header Title with Add Problem Action */}
          <div className="dashboard-title-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h1 className="dashboard-heading">{activeTab}</h1>
            <button
              type="button"
              className="add-room-btn"
              onClick={() => setShowNewProblemModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Add Problem</span>
            </button>
          </div>

          {/* ===================================================================
              VIEW 1: REPORT PROBLEM
              =================================================================== */}
          {activeTab === 'Report problem' && (
            <div style={{ maxWidth: '680px' }}>
              <section className="dashboard-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                      Add Problem
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Report any issue in your room. Our maintenance team will be notified immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="add-room-btn"
                    onClick={() => setShowNewProblemModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>Add Problem</span>
                  </button>
                </div>

                <form onSubmit={handleReportSubmit} className="new-problem-form">
                  {/* Room & Tenant Assigned Info Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                      <label className="input-label">Assigned Room</label>
                      <input
                        type="text"
                        className="form-input"
                        value={tenantRoom}
                        disabled
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600, color: '#0284c7' }}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Tenant Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={tenantName}
                        disabled
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
                      />
                    </div>
                  </div>

                  {/* Category & Priority Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                      <label className="input-label">Category</label>
                      <select
                        name="category"
                        className="form-input form-select"
                        value={problemForm.category}
                        onChange={handleFormChange}
                      >
                        <option value="Plumbing">🔧 Plumbing</option>
                        <option value="Electrical">⚡ Electrical</option>
                        <option value="Cleaning">✨ Cleaning</option>
                        <option value="HVAC">💨 HVAC / AC</option>
                        <option value="Carpentry">🔨 Carpentry / Furniture</option>
                        <option value="Other">📦 Other Issue</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Priority</label>
                      <select
                        name="priority"
                        className="form-input form-select"
                        value={problemForm.priority}
                        onChange={handleFormChange}
                      >
                        <option value="Low">🟢 Low Priority</option>
                        <option value="Medium">🟡 Medium Priority</option>
                        <option value="High">🔴 High Priority (Urgent)</option>
                      </select>
                    </div>
                  </div>

                  {/* Problem Title */}
                  <div className="input-group">
                    <label className="input-label">Problem Summary / Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      placeholder="e.g. Tap leaking in washroom or Light bulb fused"
                      value={problemForm.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  {/* Problem Description */}
                  <div className="input-group">
                    <label className="input-label">Detailed Description</label>
                    <textarea
                      name="description"
                      className="form-input"
                      rows={4}
                      placeholder="Describe the issue with any relevant details..."
                      value={problemForm.description}
                      onChange={handleFormChange}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="submit"
                      className="login-submit-btn modal-action"
                      disabled={isSubmitting}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', width: 'auto' }}
                    >
                      <Plus size={15} />
                      <span>{isSubmitting ? 'Adding Problem...' : 'Add Problem'}</span>
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* ===================================================================
              VIEW 2: MY PROBLEM
              =================================================================== */}
          {activeTab === 'My problem' && (
            <>
              {/* Problem Stats KPI Row */}
              <div className="metrics-cards-row" style={{ marginBottom: '22px' }}>
                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box amber">
                      <Wrench size={18} />
                    </div>
                    <span className="metric-title">Total Submitted</span>
                  </div>
                  <div className="metric-value">{totalMyProblems}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box blue">
                      <Clock size={18} />
                    </div>
                    <span className="metric-title">Pending / In Progress</span>
                  </div>
                  <div className="metric-value">{inProgressCount}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box cyan">
                      <CheckCircle size={18} />
                    </div>
                    <span className="metric-title">Resolved</span>
                  </div>
                  <div className="metric-value">{resolvedCount}</div>
                </div>
              </div>

              {/* Problems Table / List */}
              <section className="dashboard-card all-problems-card">
                <div className="problems-card-header">
                  <div>
                    <h2 className="card-section-title">My Reported Issues</h2>
                    <p className="card-section-desc">
                      Issues filed for Room {tenantRoom} • {myProblems.length} tickets total
                    </p>
                  </div>
                  <button
                    type="button"
                    className="add-room-btn"
                    onClick={() => setShowNewProblemModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>Add Problem</span>
                  </button>
                </div>

                {myProblems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '52px 20px', color: '#64748b' }}>
                    <CheckCircle size={38} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block', color: '#10b981' }} />
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#94a3b8' }}>No problems reported yet</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Everything is looking good in Room {tenantRoom}. Click 'Report problem' above if you need any help!
                    </div>
                  </div>
                ) : (
                  <div className="problems-table-wrapper">
                    <table className="problems-table">
                      <thead>
                        <tr>
                          <th>TICKET ID</th>
                          <th>SUMMARY / ISSUE</th>
                          <th>CATEGORY</th>
                          <th>ROOM</th>
                          <th>ASSIGNED TO</th>
                          <th>PRIORITY</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProblems.map((p) => {
                          const isResolved = p.status === 'Resolved';
                          return (
                            <tr key={p.id}>
                              <td className="problem-id-cell">{p.id}</td>
                              <td style={{ fontWeight: 600, color: '#1e293b' }}>
                                <div>{p.title || p.description}</div>
                                {p.createdAt && (
                                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                                    Filed on {p.createdAt}
                                  </div>
                                )}
                              </td>
                              <td className="category-cell">
                                {getCategoryIcon(p.category)}
                                <span>{p.category}</span>
                              </td>
                              <td className="room-cell">{p.room}</td>
                              <td className="worker-cell">
                                {p.worker && p.worker !== '— Unassigned' ? (
                                  <span style={{ fontWeight: 600, color: '#0284c7' }}>{p.worker}</span>
                                ) : (
                                  <span className="unassigned-text">Unassigned</span>
                                )}
                              </td>
                              <td>
                                <span className={`priority-pill ${p.priority?.toLowerCase() || 'medium'}`}>
                                  {p.priority || 'Medium'}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill ${p.status?.toLowerCase().replace(' ', '-') || 'open'}`}>
                                  {isResolved && <CheckCircle size={12} className="resolved-check" />}
                                  {p.status || 'Open'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODALS & TOAST NOTIFICATION
          ========================================================================= */}

      {/* Add Problem Modal */}
      {showNewProblemModal && (
        <div className="modal-backdrop" onClick={() => setShowNewProblemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowNewProblemModal(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className="modal-body">
              <h3>Add Problem</h3>
              <p>Submit a new maintenance request for Room {tenantRoom}.</p>

              <form onSubmit={handleReportSubmit} className="new-problem-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">Assigned Room</label>
                    <input
                      type="text"
                      className="form-input"
                      value={tenantRoom}
                      disabled
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600, color: '#0284c7' }}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Tenant Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={tenantName}
                      disabled
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select
                      name="category"
                      className="form-input form-select"
                      value={problemForm.category}
                      onChange={handleFormChange}
                    >
                      <option value="Plumbing">🔧 Plumbing</option>
                      <option value="Electrical">⚡ Electrical</option>
                      <option value="Cleaning">✨ Cleaning</option>
                      <option value="HVAC">💨 HVAC / AC</option>
                      <option value="Carpentry">🔨 Carpentry / Furniture</option>
                      <option value="Other">📦 Other Issue</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Priority</label>
                    <select
                      name="priority"
                      className="form-input form-select"
                      value={problemForm.priority}
                      onChange={handleFormChange}
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🔴 High Priority (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Problem Summary / Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="e.g. Tap leaking in washroom or Light bulb fused"
                    value={problemForm.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Detailed Description</label>
                  <textarea
                    name="description"
                    className="form-input"
                    rows={3}
                    placeholder="Describe the issue with any relevant details..."
                    value={problemForm.description}
                    onChange={handleFormChange}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    className="login-submit-btn modal-action"
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      width: '100%'
                    }}
                  >
                    <Plus size={15} />
                    <span>{isSubmitting ? 'Adding Problem...' : 'Add Problem'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast-notification">
          <CheckCircle size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;
