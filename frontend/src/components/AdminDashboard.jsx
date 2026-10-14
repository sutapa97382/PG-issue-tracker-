import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Wrench,
  FileBarChart,
  Settings,
  LogOut,
  ChevronDown,
  User,
  DoorClosed,
  Plus,
  Zap,
  Sparkles,
  Wind,
  CheckCircle,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ChevronRight,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import './AdminDashboard.css';

// Crisp WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Electrical':
      return <Zap size={14} className="cat-icon electrical" />;
    case 'Cleaning':
      return <Sparkles size={14} className="cat-icon cleaning" />;
    case 'HVAC':
      return <Wind size={14} className="cat-icon hvac" />;
    default:
      return <Wrench size={14} className="cat-icon plumbing" />;
  }
};


export const AdminDashboard = ({ adminInfo, onLogout }) => {
  // Admin display name & initials (clean human name)
  let adminName = adminInfo?.name || localStorage.getItem('propmate_admin_name') || 'Sutapa';
  if (/sutapamaity\d*/i.test(adminName)) {
    adminName = 'Sutapa';
  }
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'S';

  const [activeTab, setActiveTab] = useState('Properties / Rooms'); // Default to 'Properties / Rooms' as requested
  const [tabHistory, setTabHistory] = useState([]);

  // Navigate to tab and record history so user can back one by one
  const handleTabClick = (tabName) => {
    if (tabName !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(tabName);
    }
  };

  // Back step-by-step: modals first -> search/filter -> previous tabs one by one -> login
  const handleBack = () => {
    if (showNewProblemModal || showAddRoomModal) {
      setShowNewProblemModal(false);
      setShowAddRoomModal(false);
      return;
    }
    if (searchQuery.trim() !== '' || statusFilter !== 'All') {
      setSearchQuery('');
      setStatusFilter('All');
      return;
    }
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTab(prevTab);
      return;
    }
    if (activeTab !== 'Properties / Rooms') {
      setActiveTab('Properties / Rooms');
      return;
    }
    if (onLogout) {
      onLogout();
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [showAllKeys, setShowAllKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    changePassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Properties / Rooms Data: empty until admin adds rooms & tenants
  const [propertyRooms, setPropertyRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('propmate_rooms_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('propmate_rooms_v2', JSON.stringify(propertyRooms));
    } catch (e) {
      console.error(e);
    }
  }, [propertyRooms]);

  // Form state for adding new room
  const [newRoomForm, setNewRoomForm] = useState({
    room: '',
    tenant: '',
    status: 'Occupied'
  });

  // Problems Data: empty until reported
  const [problems, setProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('propmate_problems_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('propmate_problems_v2', JSON.stringify(problems));
    } catch (e) {
      console.error(e);
    }
  }, [problems]);

  const [newProblem, setNewProblem] = useState({
    tenant: '',
    room: 'R101',
    category: 'Plumbing',
    priority: 'Medium'
  });

  // Key visibility toggles
  const toggleKeyVisibility = (id) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleShowAllKeys = () => {
    const next = !showAllKeys;
    setShowAllKeys(next);
    const updated = {};
    propertyRooms.forEach((r) => {
      updated[r.id] = next;
    });
    setRevealedKeys(updated);
  };

  // Action handlers
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setToastMessage(`Copied ${key} to clipboard!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleShareWhatsApp = (room) => {
    const text = `Hi ${room.tenant}, here is your secure PropMate 360 Room Secret Key for Room ${room.room}: ${room.secretKey}. You can log in using this key at our portal.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setToastMessage(`Opening WhatsApp share for ${room.tenant}...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteRoom = (roomId, roomNumber) => {
    if (window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
      setPropertyRooms((prev) => prev.filter((r) => r.id !== roomId));
      setToastMessage(`Room ${roomNumber} deleted successfully.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword.trim() || !passwordForm.changePassword.trim()) {
      alert('Please fill out both Current Password and Change Password fields.');
      return;
    }
    const storedPassword = localStorage.getItem('propmate_admin_password') || 'admin123';
    if (passwordForm.currentPassword !== storedPassword) {
      alert('Current password is wrong. Please enter your correct current password.');
      return;
    }
    localStorage.setItem('propmate_admin_password', passwordForm.changePassword.trim());
    setToastMessage('Password updated successfully!');
    setPasswordForm({ currentPassword: '', changePassword: '' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    const rawRoom = newRoomForm.room.trim().toUpperCase();
    if (!rawRoom) return;

    // Format validation: A-101, B-204, R102, 101 are all valid
    const roomRegex = /^[A-Za-z0-9-]+$/;
    if (!roomRegex.test(rawRoom)) {
      alert('Invalid room number format. Room number can only contain letters, numbers, and hyphens (e.g., A-101, B-204, R102, 101).');
      return;
    }

    if (propertyRooms.some((r) => r.room.toUpperCase() === rawRoom)) {
      alert(`Room ${rawRoom} already exists.`);
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanRoom = rawRoom;
    const generatedKey = `ROOM-${cleanRoom}-${randomSuffix}`;

    const tenantName = newRoomForm.tenant.trim() || 'New Tenant';
    const initials = tenantName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newEntry = {
      id: Date.now().toString(),
      room: cleanRoom,
      tenant: tenantName,
      tenantInitials: initials,
      tenantColor: '#3b82f6',
      secretKey: generatedKey,
      status: newRoomForm.status
    };

    setPropertyRooms([...propertyRooms, newEntry]);
    setNewRoomForm({ room: '', tenant: '', status: 'Occupied' });
    setShowAddRoomModal(false);
    setToastMessage(`Room ${cleanRoom} added successfully! Secret Key: ${generatedKey}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateProblem = (e) => {
    e.preventDefault();
    if (!newProblem.tenant.trim()) return;

    const initials = newProblem.tenant
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created = {
      id: `PRB-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant: newProblem.tenant,
      tenantInitials: initials || 'TN',
      tenantColor: '#3b82f6',
      room: newProblem.room,
      category: newProblem.category,
      worker: '— Unassigned',
      workerInitials: null,
      workerColor: null,
      priority: newProblem.priority,
      status: 'Open'
    };

    setProblems([created, ...problems]);
    setNewProblem({ tenant: '', room: propertyRooms[0]?.room || '', category: 'Plumbing', priority: 'Medium' });
    setShowNewProblemModal(false);
  };

  const navItems = [
    { name: 'Properties / Rooms', icon: <Building2 size={18} /> },
    { name: 'Tenants', icon: <Users size={18} /> },
    { name: 'Reports', icon: <FileBarChart size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> }
  ];

  // Filtered rooms list
  const filteredRooms = propertyRooms.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.room.toLowerCase().includes(q) ||
        r.tenant.toLowerCase().includes(q) ||
        r.secretKey.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Live dynamic counts based on actual properties & rooms data
  const totalRoomsCount = propertyRooms.length;
  const totalTenantsCount = propertyRooms.filter(
    (r) => r.tenant && r.tenant.trim() !== '' && r.tenant !== '—' && r.tenant.toLowerCase() !== 'vacant'
  ).length;

  return (
    <div className="admin-dashboard-container">
      {/* =========================================================================
          LEFT SIDEBAR (Navy Blue)
          ========================================================================= */}
      <aside className="dashboard-sidebar">
        {/* Logo & Enterprise Subtitle */}
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
              <span className="brand-subtitle">ENTERPRISE SaaS</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {/* Back Arrow Navigation Option */}
          <button
            type="button"
            className="sidebar-nav-btn sidebar-back-nav-btn"
            onClick={handleBack}
            title={
              showNewProblemModal || showAddRoomModal
                ? 'Close modal / Back'
                : tabHistory.length > 0
                ? `Back to ${tabHistory[tabHistory.length - 1]}`
                : 'Back to Login'
            }
          >
            <span className="nav-icon"><ArrowLeft size={18} /></span>
            <span className="nav-text">Back</span>
          </button>

          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <span className="sidebar-version">v2.4.1</span>
          <button type="button" className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="dashboard-main-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar" style={{ justifyContent: 'flex-end' }}>
          <div className="topbar-actions">
            {/* User Profile */}
            <div className="topbar-profile-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="profile-avatar">{adminInitials}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="profile-name" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {adminName}
                </span>
                <span className="profile-role" style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, lineHeight: 1.2 }}>
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Page Section Title */}
          <div className="dashboard-title-box">
            <h1 className="dashboard-heading">
              {activeTab === 'Reports' ? 'Reports — All Problems' : activeTab}
            </h1>
          </div>

          {/* =====================================================================
              VIEW 1: PROPERTIES / ROOMS SECTION
              ===================================================================== */}
          {activeTab === 'Properties / Rooms' && (
            <>
              {/* METRICS / KPI CARDS (2 Cards Row - Live Dynamic Counts) */}
              <div className="metrics-cards-row">
                {/* Card 1: Total Tenants */}
                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box blue">
                      <User size={18} />
                    </div>
                    <span className="metric-title">Total Tenants</span>
                  </div>
                  <div className="metric-value">{totalTenantsCount}</div>
                </div>

                {/* Card 2: Total Rooms */}
                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box cyan">
                      <DoorClosed size={18} />
                    </div>
                    <span className="metric-title">Total Rooms</span>
                  </div>
                  <div className="metric-value">{totalRoomsCount}</div>
                </div>
              </div>



              {/* =====================================================================
              STEP 2: PROPERTIES / ROOMS — SECRET KEY MANAGEMENT CARD
              ===================================================================== */}
              <section className="dashboard-card properties-rooms-card">
                {/* Step 2 Callout Banner matching user screenshot */}
                <div className="secret-key-guide-banner">
                  <div className="step-title-row">
                    <span className="step-title-badge">Properties / Rooms — Secret Key Management</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="properties-header-row" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div className="properties-actions-group">
                    <button
                      type="button"
                      className="add-room-btn"
                      onClick={() => setShowAddRoomModal(true)}
                    >
                      <Plus size={15} />
                      <span>Add Room</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-btn ${showFilterMenu ? 'active' : ''}`}
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                      <SlidersHorizontal size={14} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Filter Menu Drawer */}
                {showFilterMenu && (
                  <div className="filter-dropdown-bar">
                    <span className="filter-bar-label">Filter Status:</span>
                    {['All', 'Occupied', 'Vacant'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-pill-btn ${statusFilter === st ? 'active' : ''}`}
                        onClick={() => setStatusFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}

                {/* Properties Table: Only shown when rooms and tenants have been added */}
                {propertyRooms.length > 0 && (
                  <div className="properties-table-wrapper">
                    <table className="properties-table">
                      <thead>
                        <tr>
                          <th>Room Number</th>
                          <th>Tenant Name</th>
                          <th>Room Secret Key</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((r) => (
                          <tr key={r.id}>
                            {/* Room Number */}
                            <td className="room-col">
                              <div className="room-info-cell">
                                <Building2 size={16} className="room-bldg-icon" />
                                <span className="room-number-text">{r.room}</span>
                              </div>
                            </td>

                            {/* Tenant Name */}
                            <td className="tenant-col">
                              <div className="tenant-info-cell">
                                <div
                                  className="tenant-avatar"
                                  style={{ backgroundColor: r.tenantColor }}
                                >
                                  {r.tenantInitials}
                                </div>
                                <span className="tenant-name-text">{r.tenant}</span>
                              </div>
                            </td>

                            {/* Room Secret Key */}
                            <td className="key-col">
                              {(() => {
                                const isRevealed = !!revealedKeys[r.id];
                                return (
                                  <div
                                    className={`secret-key-cell ${isRevealed ? 'is-revealed' : 'is-masked'}`}
                                    onClick={() => toggleKeyVisibility(r.id)}
                                    title={isRevealed ? "Click to mask secret key" : "Click to view secret key"}
                                  >
                                    <span className="secret-key-value">
                                      {isRevealed ? r.secretKey : '•••••••••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      className="key-eye-toggle-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleKeyVisibility(r.id);
                                      }}
                                      title={isRevealed ? "Hide secret key" : "Click to view secret key"}
                                      aria-label={isRevealed ? "Hide key" : "Show key"}
                                    >
                                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button
                                      type="button"
                                      className="key-copy-icon-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyKey(r.secretKey);
                                      }}
                                      title="Copy Secret Key"
                                      aria-label={`Copy key ${r.secretKey}`}
                                    >
                                      {copiedKey === r.secretKey ? (
                                        <Check size={14} className="copied-icon-active" />
                                      ) : (
                                        <Copy size={14} />
                                      )}
                                    </button>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Status & Delete Option */}
                            <td className="status-col">
                              <div className="status-cell-wrapper">
                                <span className={`room-status-badge ${r.status.toLowerCase()}`}>
                                  {r.status}
                                </span>
                                <button
                                  type="button"
                                  className="room-delete-btn"
                                  onClick={() => handleDeleteRoom(r.id, r.room)}
                                  title={`Delete Room ${r.room}`}
                                  aria-label={`Delete Room ${r.room}`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

            </>
          )}

          {/* =====================================================================
              VIEW 2: REPORTS SECTION (ALL PROBLEMS DASHBOARD)
              ===================================================================== */}
          {activeTab === 'Reports' && (
            <>
              {/* Problem Stats KPI Cards */}
              <div className="metrics-cards-row" style={{ marginBottom: '22px' }}>
                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box amber">
                      <Wrench size={18} />
                    </div>
                    <span className="metric-title">Total Issues Reported</span>
                  </div>
                  <div className="metric-value">{problems.length}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box blue">
                      <Sparkles size={18} />
                    </div>
                    <span className="metric-title">In Progress</span>
                  </div>
                  <div className="metric-value">{problems.filter((p) => p.status === 'In Progress').length}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-header">
                    <div className="metric-icon-box cyan">
                      <CheckCircle size={18} />
                    </div>
                    <span className="metric-title">Resolved</span>
                  </div>
                  <div className="metric-value">{problems.filter((p) => p.status === 'Resolved').length}</div>
                </div>
              </div>

              {/* All Problems Table */}
              <section className="dashboard-card all-problems-card">
                <div className="problems-card-header">
                  <div>
                    <h2 className="card-section-title">All Problems</h2>
                    <p className="card-section-desc">
                      Recent issues reported by tenants • {problems.length} issues total
                    </p>
                  </div>
                </div>

                {problems.length > 0 && (
                  <div className="problems-table-wrapper">
                    <table className="problems-table">
                      <thead>
                        <tr>
                          <th>PROBLEM ID</th>
                          <th>TENANT</th>
                          <th>ROOM</th>
                          <th>CATEGORY</th>
                          <th>WORKER ASSIGNED</th>
                          <th>PRIORITY</th>
                          <th>STATUS</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problems.map((p) => {
                          const isResolved = p.status === 'Resolved';
                          return (
                            <tr key={p.id}>
                              <td className="problem-id-cell">{p.id}</td>
                              <td className="tenant-cell">
                                <div
                                  className="user-mini-avatar"
                                  style={{ backgroundColor: p.tenantColor }}
                                >
                                  {p.tenantInitials}
                                </div>
                                <span className="tenant-name">{p.tenant}</span>
                              </td>
                              <td className="room-cell">{p.room}</td>
                              <td className="category-cell">
                                {getCategoryIcon(p.category)}
                                <span>{p.category}</span>
                              </td>
                              <td className="worker-cell">
                                {p.workerInitials ? (
                                  <div className="worker-info-box">
                                    <div
                                      className="worker-mini-avatar"
                                      style={{ backgroundColor: p.workerColor }}
                                    >
                                      {p.workerInitials}
                                    </div>
                                    <span>{p.worker}</span>
                                  </div>
                                ) : (
                                  <span className="unassigned-text">{p.worker}</span>
                                )}
                              </td>
                              <td>
                                <span className={`priority-pill ${p.priority.toLowerCase()}`}>
                                  {p.priority}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status-pill ${p.status.toLowerCase().replace(' ', '-')}`}
                                >
                                  {isResolved && <CheckCircle size={12} className="resolved-check" />}
                                  {p.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`action-assign-btn ${isResolved ? 'disabled' : ''}`}
                                  disabled={isResolved}
                                  onClick={() => {
                                    alert(`Assigning worker for ticket ${p.id}`);
                                  }}
                                >
                                  Assign
                                </button>
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

          {/* VIEW: TENANTS */}
          {activeTab === 'Tenants' && (
            <section className="dashboard-card properties-rooms-card">
              <div className="secret-key-guide-banner">
                <div className="step-title-row">
                  <span className="step-title-badge">Tenants Directory</span>
                </div>
              </div>
              {/* Tenants Table: Only shown when tenants exist */}
              {propertyRooms.length > 0 && (
                <div className="properties-table-wrapper">
                  <table className="properties-table">
                    <thead>
                      <tr>
                        <th>Tenant Name</th>
                        <th>Room Assigned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyRooms.map((r) => (
                        <tr key={r.id}>
                          <td className="tenant-col">
                            <div className="tenant-info-cell">
                              <div className="tenant-avatar" style={{ backgroundColor: r.tenantColor }}>
                                {r.tenantInitials}
                              </div>
                              <span className="tenant-name-text">{r.tenant}</span>
                            </div>
                          </td>
                          <td className="room-col">
                            <div className="room-info-cell">
                              <Building2 size={16} className="room-bldg-icon" />
                              <span className="room-number-text">{r.room}</span>
                            </div>
                          </td>
                          <td className="status-col">
                            <span className={`room-status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}



          {/* VIEW: SETTINGS */}
          {activeTab === 'Settings' && (
            <section className="dashboard-card properties-rooms-card">
              <div className="secret-key-guide-banner">
                <div className="step-title-row">
                  <span className="step-title-badge">Security Settings — Password</span>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '440px', padding: '6px 0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                      aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                    Change Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showChangePassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={passwordForm.changePassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, changePassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title={showChangePassword ? 'Hide password' : 'Show password'}
                      aria-label={showChangePassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showChangePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '6px' }}>
                  <button
                    type="submit"
                    className="add-room-btn"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: '14px' }}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODALS & TOAST NOTIFICATION
          ========================================================================= */}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast-notification">
          <CheckCircle size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="modal-backdrop" onClick={() => setShowAddRoomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddRoomModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-body">
              <h3>Add New Room & Access Key</h3>
              <p>Configure a room, assign a tenant, and generate a secret key.</p>
              <form onSubmit={handleAddRoom} className="new-problem-form">
                <div className="input-group">
                  <label className="input-label">Room Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A-101, B-204, R102, 101"
                    pattern="^[A-Za-z0-9-]+$"
                    title="Room numbers can contain letters, numbers, and hyphens (e.g., A-101, B-204, R102, 101)"
                    value={newRoomForm.room}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, room: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Tenant Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vikram Sharma"
                    value={newRoomForm.tenant}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, tenant: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Status</label>
                  <select
                    className="form-input form-select"
                    value={newRoomForm.status}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, status: e.target.value })}
                  >
                    <option value="Occupied">Occupied</option>
                    <option value="Vacant">Vacant</option>
                  </select>
                </div>
                <button type="submit" className="login-submit-btn modal-action">
                  Generate Key & Add Room
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Problem Modal */}
      {showNewProblemModal && (
        <div className="modal-backdrop" onClick={() => setShowNewProblemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowNewProblemModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-body">
              <h3>Report New Problem</h3>
              <p>Submit a new maintenance request directly into the tracker.</p>
              <form onSubmit={handleCreateProblem} className="new-problem-form">
                <div className="input-group">
                  <label className="input-label">Tenant Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={newProblem.tenant}
                    onChange={(e) => setNewProblem({ ...newProblem, tenant: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Room Number</label>
                  <select
                    className="form-input form-select"
                    value={newProblem.room}
                    onChange={(e) => setNewProblem({ ...newProblem, room: e.target.value })}
                  >
                    {propertyRooms.length === 0 ? (
                      <option value="">No rooms available</option>
                    ) : (
                      propertyRooms.map((r) => (
                        <option key={r.id} value={r.room}>{r.room}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="form-input form-select"
                    value={newProblem.category}
                    onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="HVAC">HVAC</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select
                    className="form-input form-select"
                    value={newProblem.priority}
                    onChange={(e) => setNewProblem({ ...newProblem, priority: e.target.value })}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <button type="submit" className="login-submit-btn modal-action">
                  Submit Problem
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
