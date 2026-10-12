import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ClipboardList,
  LogOut,
  Building2,
  Key,
  User,
  DoorClosed,
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Hammer,
  CheckCircle,
  Clock,
  Shield,
  Plus,
  Send,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Camera
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
    case 'Carpentry':
      return <Hammer size={15} className="cat-icon plumbing" />;
    case 'Other':
      return <HelpCircle size={15} className="cat-icon plumbing" />;
    default:
      return <Wrench size={15} className="cat-icon plumbing" />;
  }
};

const CATEGORIES = [
  { id: 'Plumbing', label: 'Plumbing', icon: <Wrench size={16} /> },
  { id: 'Electrical', label: 'Electrical', icon: <Zap size={16} /> },
  { id: 'Cleaning', label: 'Cleaning', icon: <Sparkles size={16} /> },
  { id: 'HVAC', label: 'HVAC', icon: <Wind size={16} /> },
  { id: 'Carpentry', label: 'Carpentry', icon: <Hammer size={16} /> },
  { id: 'Other', label: 'Other Issue', icon: <HelpCircle size={16} /> }
];

const PRIORITIES = [
  { id: 'Low', label: 'Low', color: '#22C55E' },
  { id: 'Medium', label: 'Medium', color: '#EAB308' },
  { id: 'High', label: 'High', color: '#EF4444' }
];

export const UserDashboard = ({ tenantInfo, onLogout }) => {
  // Active sidebar tab: 'Report problem' | 'My problem' (persisted across reloads)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('propmate_tenant_active_tab') || 'Report problem';
    } catch {
      return 'Report problem';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('propmate_tenant_active_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);
  const [toastMessage, setToastMessage] = useState(null);
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);

  // Custom dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tenant profile details (fallback if not provided)
  const tenantName = tenantInfo?.tenant || tenantInfo?.name || 'Tenant User';
  const tenantRoom = tenantInfo?.room || 'Room R101';
  const tenantSecretKey = tenantInfo?.secretKey || 'ROOM-KEY-SECURE';

  const cleanRoomNumber = tenantRoom?.toLowerCase().startsWith('room')
    ? tenantRoom.replace(/^room\s*/i, '').trim()
    : tenantRoom;

  // Form state for reporting a problem (with picture upload instead of detailed description)
  const [problemForm, setProblemForm] = useState({
    title: '',
    category: 'Plumbing',
    priority: 'Medium',
    image: null,
    imageName: '',
    imageSize: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please select an image file (PNG, JPG, WEBP)');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToastMessage('Image size must be less than 5MB');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setProblemForm((prev) => ({
        ...prev,
        image: reader.result,
        imageName: file.name,
        imageSize: sizeStr
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleCancel = () => {
    setProblemForm({
      title: '',
      category: 'Plumbing',
      priority: 'Medium',
      image: null,
      imageName: '',
      imageSize: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (modalFileInputRef.current) modalFileInputRef.current.value = '';
  };

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
      description: title.trim(),
      image: problemForm.image || null,
      imageName: problemForm.imageName || null,
      imageSize: problemForm.imageSize || null,
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
        category: 'Plumbing',
        priority: 'Medium',
        image: null,
        imageName: '',
        imageSize: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
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
            {/* Active tab */}
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
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="dashboard-main-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar" style={{ justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <span>Tenant Dashboard</span>
            <ChevronRight size={14} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{activeTab}</span>
          </div>

          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="topbar-profile-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="profile-avatar" style={{ background: '#0284c7', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                {tenantName[0]?.toUpperCase() || 'T'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="profile-name" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{tenantName}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Room {cleanRoomNumber}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 73px)' }}>
          {/* Header Title (Clean without duplicate center button) */}
          <div className="dashboard-title-box" style={{ marginBottom: '24px' }}>
            <h1 className="dashboard-heading" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
              {activeTab}
            </h1>
            {activeTab === 'Report problem' ? (
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                Submit a maintenance ticket for your room and track its progress in real-time.
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                Track the status and resolution of your reported maintenance requests.
              </p>
            )}
          </div>

          {/* ===================================================================
              VIEW 1: REPORT PROBLEM
              =================================================================== */}
          {activeTab === 'Report problem' && (
            <div style={{ maxWidth: '48rem', margin: '0 auto', width: '100%' }}>
              <section
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
                  padding: '32px'
                }}
              >
                {/* Form Header (No duplicate Add Problem button) */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                    Report a Problem
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Report any issue in your room. Our maintenance team will be notified immediately.
                  </p>
                </div>

                <form onSubmit={handleReportSubmit} className="new-problem-form" noValidate>
                  {/* Read-Only Info Chips: Room & Tenant Name */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                      Reporting Details
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 14px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '9999px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#334155'
                        }}
                      >
                        <DoorClosed size={15} style={{ color: '#64748B' }} />
                        <span>Room {cleanRoomNumber}</span>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 14px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '9999px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#334155'
                        }}
                      >
                        <User size={15} style={{ color: '#64748B' }} />
                        <span>Name {tenantName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category & Priority Row (Custom Dropdowns with Icons & Colored Dots) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '20px',
                      marginBottom: '22px'
                    }}
                  >
                    {/* Category Dropdown */}
                    <div ref={categoryDropdownRef} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '7px' }}>
                        Category
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCategoryOpen(!isCategoryOpen);
                          setIsPriorityOpen(false);
                        }}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 14px',
                          backgroundColor: '#FFFFFF',
                          border: isCategoryOpen ? '1px solid #2563EB' : '1px solid #E2E8F0',
                          boxShadow: isCategoryOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#0F172A',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                          <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center' }}>
                            {CATEGORIES.find((c) => c.id === problemForm.category)?.icon || <Wrench size={16} />}
                          </span>
                          <span>{CATEGORIES.find((c) => c.id === problemForm.category)?.label || problemForm.category}</span>
                        </div>
                        <ChevronDown
                          size={15}
                          style={{
                            color: '#64748B',
                            transform: isCategoryOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease'
                          }}
                        />
                      </button>

                      {isCategoryOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                            padding: '6px',
                            zIndex: 60
                          }}
                        >
                          {CATEGORIES.map((cat) => {
                            const isSelected = problemForm.category === cat.id;
                            return (
                              <div
                                key={cat.id}
                                onClick={() => {
                                  setProblemForm((prev) => ({ ...prev, category: cat.id }));
                                  setIsCategoryOpen(false);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '9px 12px',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  color: isSelected ? '#2563EB' : '#334155',
                                  backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                                  fontWeight: isSelected ? 600 : 400,
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ color: isSelected ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center' }}>
                                    {cat.icon}
                                  </span>
                                  <span>{cat.label}</span>
                                </div>
                                {isSelected && <Check size={15} style={{ color: '#2563EB' }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Priority Dropdown */}
                    <div ref={priorityDropdownRef} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '7px' }}>
                        Priority
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPriorityOpen(!isPriorityOpen);
                          setIsCategoryOpen(false);
                        }}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 14px',
                          backgroundColor: '#FFFFFF',
                          border: isPriorityOpen ? '1px solid #2563EB' : '1px solid #E2E8F0',
                          boxShadow: isPriorityOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#0F172A',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                          <span
                            style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              backgroundColor: PRIORITIES.find((p) => p.id === problemForm.priority)?.color || '#EAB308',
                              display: 'inline-block'
                            }}
                          />
                          <span>{PRIORITIES.find((p) => p.id === problemForm.priority)?.label || problemForm.priority} Priority</span>
                        </div>
                        <ChevronDown
                          size={15}
                          style={{
                            color: '#64748B',
                            transform: isPriorityOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease'
                          }}
                        />
                      </button>

                      {isPriorityOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                            padding: '6px',
                            zIndex: 60
                          }}
                        >
                          {PRIORITIES.map((pri) => {
                            const isSelected = problemForm.priority === pri.id;
                            return (
                              <div
                                key={pri.id}
                                onClick={() => {
                                  setProblemForm((prev) => ({ ...prev, priority: pri.id }));
                                  setIsPriorityOpen(false);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '9px 12px',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  color: isSelected ? '#0F172A' : '#334155',
                                  backgroundColor: isSelected ? '#F1F5F9' : 'transparent',
                                  fontWeight: isSelected ? 600 : 400,
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span
                                    style={{
                                      width: '9px',
                                      height: '9px',
                                      borderRadius: '50%',
                                      backgroundColor: pri.color,
                                      display: 'inline-block'
                                    }}
                                  />
                                  <span>{pri.label} Priority</span>
                                </div>
                                {isSelected && <Check size={15} style={{ color: '#2563EB' }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Problem Summary Input */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '7px' }}>
                      Problem Summary
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      placeholder="e.g., Tap leaking in washroom or Light bulb fused"
                      value={problemForm.title}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 14px',
                        fontSize: '14px',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Upload Picture (Replaces Detailed Description) */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                        Upload Picture
                      </label>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </div>

                    {!problemForm.image ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: isDragging ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
                          backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                          borderRadius: '14px',
                          padding: '32px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = '#94A3B8';
                            e.currentTarget.style.backgroundColor = '#F1F5F9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                          }}
                        >
                          <UploadCloud size={24} />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                          Click to upload photo or drag & drop
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Add a photo showing the issue (tap, wall, wiring, leakage, etc.)
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          position: 'relative',
                          border: '1px solid #E2E8F0',
                          borderRadius: '14px',
                          backgroundColor: '#F8FAFC',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        <img
                          src={problemForm.image}
                          alt="Issue preview"
                          style={{
                            width: '84px',
                            height: '84px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {problemForm.imageName || 'problem_photo.jpg'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {problemForm.imageSize || 'Image ready'}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              marginTop: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#2563EB',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: 0,
                              background: 'none',
                              border: 'none'
                            }}
                          >
                            <Camera size={13} />
                            <span>Change photo</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProblemForm((prev) => ({ ...prev, image: null, imageName: '', imageSize: '' }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          title="Remove picture"
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            color: '#EF4444',
                            backgroundColor: '#FEE2E2',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Row: Cancel (ghost) & Submit Problem (blue) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '24px',
                      marginTop: '28px',
                      borderTop: '1px solid #F1F5F9',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                        e.currentTarget.style.color = '#0F172A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#64748B';
                      }}
                    >
                      Cancel
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>
                        You'll receive updates via in-app
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.2)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubmitting) e.currentTarget.style.backgroundColor = '#1D4ED8';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                      >
                        <Plus size={16} />
                        <span>{isSubmitting ? 'Submitting...' : 'Submit Problem'}</span>
                      </button>
                    </div>
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
                      Issues filed for Room {cleanRoomNumber} • {myProblems.length} tickets total
                    </p>
                  </div>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>{p.title || p.description}</span>
                                  {p.image && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPhoto(p.image)}
                                      title="Click to view attached picture"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: '#EFF6FF',
                                        color: '#2563EB',
                                        border: '1px solid #BFDBFE',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <ImageIcon size={12} />
                                      <span>Photo</span>
                                    </button>
                                  )}
                                </div>
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
                  <label className="input-label">Upload Picture (Optional)</label>
                  {!problemForm.image ? (
                    <div
                      onClick={() => modalFileInputRef.current?.click()}
                      style={{
                        border: '1.5px dashed #CBD5E1',
                        borderRadius: '10px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#F8FAFC',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        ref={modalFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <UploadCloud size={22} style={{ color: '#2563EB', margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Click to select photo
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        PNG, JPG, WEBP up to 5MB
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <img
                        src={problemForm.image}
                        alt="Issue"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {problemForm.imageName || 'Photo attached'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {problemForm.imageSize || 'Ready'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProblemForm((prev) => ({ ...prev, image: null, imageName: '', imageSize: '' }));
                          if (modalFileInputRef.current) modalFileInputRef.current.value = '';
                        }}
                        style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
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

      {/* Photo Preview Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPhoto(null)}
          style={{ zIndex: 120, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px', padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>
                <ImageIcon size={18} style={{ color: '#2563EB' }} />
                <span>Problem Photo</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={selectedPhoto}
              alt="Problem attachment"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                borderRadius: '12px',
                backgroundColor: '#0F172A'
              }}
            />
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
