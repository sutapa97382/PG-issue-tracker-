# PropMate 360 - PG Property Management SaaS

[![Netlify Status](https://api.netlify.com/api/v1/badges/deployment-status?branch=main)](https://app.netlify.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)](./backend/test-apis.js)

**PropMate 360** is a full-stack SaaS property management platform engineered for PG (Paying Guest) and hostel accommodations. It provides seamless management of rooms, tenant room secret keys, maintenance issue tracking, and multi-tier authentication with rate-limiting security.

---

## 🌟 Key Features

### 🏢 Admin Portal
- **KPI Metrics Dashboard**: Real-time counters for total rooms, occupied/vacant rooms, open vs. resolved complaints, and active tenants.
- **Room & Secret Key Management**: Create rooms, auto-generate cryptographically secure room keys (`ROOM-101-XXXX`), re-assign rooms, or reset tenant keys.
- **Maintenance Operations**: View all incoming tenant tickets, assign specialized workers (plumber, electrician, etc.), and monitor issue resolution.
- **Session Security**: 2-hour cookie-backed session persistence.

### 👤 Tenant Portal
- **Frictionless Login**: One-click authentication using admin-issued Room Secret Keys.
- **Issue Submission**: Report maintenance issues with category, description, and status tracking.
- **"My Problems" Tab**: View real-time status of reported tickets (`Open`, `In Progress`, `Resolved`) with ticket deletion support.

### 🛡️ Enterprise Security & Rate Limiting
- **Brute-Force Lockout**: 5 failed login attempts (wrong password or invalid secret key) triggers an automated **15-minute security lockout** with a live real-time countdown ticker.
- **API Rate Limiting**: Powered by `express-rate-limit` to prevent DDoS attacks and spam complaint ticket flooding (`200 req/15 min` global, `5 req/15 min` auth, `10 req/10 min` ticket creation).
- **Password Protection**: Passwords salted and hashed with `bcryptjs`.
- **JWT Authorization**: Stateless JSON Web Tokens with role-based access control (`admin`, `tenant`, `worker`).

---

## 📁 Repository Structure

```text
PG-issue-tracker-/
├── frontend/                   # React (Vite) Client Application
│   ├── public/                 # Static assets & _redirects for Netlify SPA
│   ├── src/                    # Components (AdminDashboard, UserDashboard, etc.)
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite bundler configuration
│   └── package.json            # Frontend dependencies & scripts
│
├── backend/                    # Node.js & Express REST API Server
│   ├── config/db.js            # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Room, and Maintenance controllers
│   ├── middleware/             # JWT auth verification & rate limiters
│   ├── models/                 # User, Room, and Maintenance Mongoose schemas
│   ├── routes/                 # Express API routes
│   ├── utils/generateKey.js    # Unique Room Secret Key generator
│   ├── test-apis.js            # Automated backend test suite (17 tests)
│   ├── server.js               # Express server entry point (Port 5000)
│   ├── .env.example            # Environment variables template
│   └── package.json            # Backend dependencies & scripts
│
├── netlify.toml                # Netlify deployment configuration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 1. Clone Repository
```bash
git clone https://github.com/sutapa97382/PG-issue-tracker-.git
cd PG-issue-tracker-
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/propmate360
JWT_SECRET=supersecretjwtkey_propmate360_2024_secure
ADMIN_SECRET_CODE=PROPMATE_ADMIN_2026_SECURE
```

Run the backend server:
```bash
npm run dev
# Server running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 🧪 Running Automated Tests

Run the built-in API & security test suite (tests controllers, JWT signing, bcrypt hashing, secret key generation, and rate limiting):

```bash
cd backend
npm test
```

**Test Output:**
```text
====================================================
    PropMate 360 - Comprehensive API Test Suite    
====================================================
1. Utility & Security Unit Tests (3 Passed)
2. Auth API Tests (/api/auth) (4 Passed)
3. Room API Tests (/api/rooms) (2 Passed)
4. Maintenance API Tests (/api/maintenance) (3 Passed)
5. Worker Management & Access Control (2 Passed)
6. Rate Limiting Middleware Tests (3 Passed)

Test Results: 17 Passed, 0 Failed
```

---

## 🌐 Deployment Guide

### Deploying Frontend to Netlify
The repository is pre-configured with `netlify.toml` and `frontend/public/_redirects`:

1. Sign in to [Netlify](https://www.netlify.com/) with GitHub.
2. Click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Select this repository: `sutapa97382/PG-issue-tracker-`.
4. Netlify will auto-detect settings from `netlify.toml`:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **Deploy Site**.

### Deploying Backend to Render / Railway
1. Sign in to [Render](https://render.com/).
2. Create a **New Web Service** connected to this repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add your environment variables (`MONGO_URI`, `JWT_SECRET`, `ADMIN_SECRET_CODE`).

---

## 🛡️ API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/admin-signup` | Public (Secret Code) | Register new admin account |
| `POST` | `/api/auth/tenant-signup` | Public (Room Key) | Tenant registration via room secret key |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Unified login for Admin, Tenant, Worker |
| `POST` | `/api/auth/create-worker` | Private (Admin) | Create maintenance worker account |
| `GET` | `/api/rooms` | Private (Admin) | List all rooms and assignment status |
| `POST` | `/api/rooms/create` | Private (Admin) | Create room and generate secret key |
| `POST` | `/api/rooms/:id/reset-key` | Private (Admin) | Regenerate unique secret key for room |
| `GET` | `/api/maintenance` | Private (All) | Retrieve tickets (role-filtered) |
| `POST` | `/api/maintenance` | Private (Tenant) | Submit new maintenance ticket |
| `PUT` | `/api/maintenance/:id/status`| Private (Admin/Worker) | Update ticket status (`Open`, `In Progress`, `Resolved`) |
| `PUT` | `/api/maintenance/:id/assign`| Private (Admin) | Assign worker to ticket |
| `GET` | `/api/health` | Public | System status and uptime health check |

---

## 📄 License
This project is licensed under the MIT License.
