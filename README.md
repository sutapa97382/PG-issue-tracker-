# PropMate 360 - PG Property Management SaaS

A full-stack PG (Paying Guest) property management application built with **React (Vite)** on the frontend and **Node.js, Express, MongoDB (Mongoose), JWT, and bcryptjs** on the backend.

---

## 📁 Repository Structure

```text
PG problem tracker/
├── frontend/                   # React + Vite Client Application
│   ├── src/                    # Components, Pages, Assets, Styles
│   ├── public/                 # Static Assets
│   ├── index.html              # HTML Entry
│   ├── vite.config.js          # Vite Configuration
│   ├── package.json            # Frontend Dependencies & Scripts
│   └── node_modules/           # Frontend Packages
│
├── backend/                    # Node.js + Express API Server
│   ├── config/                 # Database Configuration (Mongoose)
│   ├── controllers/            # Auth, Room, and Maintenance Controllers
│   ├── middleware/             # JWT Auth & Role Checks (isAdmin)
│   ├── models/                 # User, Room, Maintenance Schemas
│   ├── routes/                 # API Endpoints (/api/auth, /api/rooms, /api/maintenance)
│   ├── utils/                  # Key Generator (ROOM-R102-7XK9)
│   ├── .env                    # Local Environment Configuration
│   ├── .env.example            # Environment Template
│   ├── package.json            # Backend Dependencies & Scripts
│   └── server.js               # Express Server Entrypoint (Port 5000)
│
├── package.json                # Root package for coordinated scripts
└── README.md                   # Project overview & quick start
```

---

## 🚀 Quick Start Guide

### 1. Run Everything from Root
```bash
# Run Frontend (Vite on http://localhost:5173)
npm run frontend

# Run Backend (Express on http://localhost:5000)
npm run backend
```

---

### 2. Frontend Development (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
- Runs at `http://localhost:5173`
- Features: Login (Tenant/Admin/Worker tabs), Admin Signup with Secret Code validation, Admin Dashboard with KPI counters, Complaints table, and Room Secret Key Management table.

---

### 3. Backend Development (`/backend`)
```bash
cd backend
npm install
npm run dev
```
- Runs at `http://localhost:5000`
- MongoDB Connection: `mongodb://127.0.0.1:27017/propmate360`
- API Health Check: `http://localhost:5000/api/health`
- See [backend/README.md](file:///c:/Users/SUTAPA/Desktop/PG%20problem%20tracker/backend/README.md) for full endpoint specifications.
