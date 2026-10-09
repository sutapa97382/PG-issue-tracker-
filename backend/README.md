# PropMate 360 - Backend API

Robust, production-grade backend for **PropMate 360** (PG Property Management SaaS) built with Node.js, Express.js, MongoDB (Mongoose), JWT, and bcryptjs.

---

## 📁 Folder Structure

```text
server/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── controllers/
│   ├── authController.js     # Signup (tenant, admin), Login, Worker creation
│   ├── roomController.js     # Room creation, listing, secret key reset
│   └── maintenanceController.js # Issue creation, updates, and worker assignment
├── middleware/
│   └── authMiddleware.js     # JWT verification & role authorization (isAdmin)
├── models/
│   ├── User.js               # Tenant, Admin, Worker schema
│   ├── Room.js               # Rooms with pre-save secret key generation
│   └── Maintenance.js        # Problem ticket schema
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── roomRoutes.js         # /api/rooms endpoints
│   └── maintenanceRoutes.js  # /api/maintenance endpoints
├── utils/
│   └── generateKey.js        # Room secret key generator (ROOM-{roomNumber}-{4 random chars})
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── package.json              # Dependencies and scripts (ES Modules)
└── server.js                 # Express server entry point on port 5000
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
Open a terminal in the `server` directory:
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Ensure `.env` contains the required keys (copied from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/propmate360
JWT_SECRET=supersecretjwtkey_propmate360_2024_secure
ADMIN_SECRET_CODE=PROP360ADMIN2024
```

### 3. Start the Server
- **Development (auto-reload with nodemon):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 🔐 Authentication & Roles

| Role | Signup Method | Capabilities |
| :--- | :--- | :--- |
| **Tenant** | Must enter valid, unoccupied `roomSecretKey` | Submits maintenance issues, views room status |
| **Admin** | Requires `adminSecretCode` matching `.env` | Creates rooms, resets room keys, creates workers, assigns issues |
| **Worker** | Cannot self-register; created exclusively by Admin | Views assigned tasks, updates ticket resolution status |

---

## 📡 API Endpoints

### 1. Authentication (`/api/auth`)

#### `POST /api/auth/tenant-signup`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "roomSecretKey": "ROOM-R102-7XK9"
  }
  ```
- **Logic**:
  - Validates key exists in database.
  - Checks if room status is already `Occupied`.
  - Hashes password using `bcryptjs` (10 salt rounds).
  - Creates user with `role: tenant` and links `roomNumber` + `roomId`.
  - Sets room status to `Occupied` and links `tenant`.
  - Returns JWT token and user info.

#### `POST /api/auth/admin-signup`
- **Access**: Public (Requires secret code)
- **Body**:
  ```json
  {
    "name": "Super Admin",
    "email": "admin@propmate360.com",
    "password": "AdminPassword123!",
    "adminSecretCode": "PROP360ADMIN2024"
  }
  ```

#### `POST /api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "Tenant"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64f1a2...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "tenant",
      "roomNumber": "R102"
    }
  }
  ```

#### `POST /api/auth/create-worker`
- **Access**: Private (Admin only)
- **Header**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Body**:
  ```json
  {
    "name": "Ramesh Kumar (Plumber)",
    "email": "ramesh@propmate.com",
    "password": "WorkerPass123!"
  }
  ```

#### `GET /api/auth/me`
- **Access**: Private (Any authenticated user)
- Returns authenticated user details.

---

### 2. Room Management (`/api/rooms`)

#### `POST /api/rooms/create`
- **Access**: Private (Admin only)
- **Header**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Body**:
  ```json
  {
    "roomNumber": "R204",
    "propertyName": "Green View PG"
  }
  ```
- **Features**: Automatically generates unique secret key (e.g. `ROOM-R204-9Z2A`).

#### `GET /api/rooms/all`
- **Access**: Private (Admin only)
- **Header**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Response**: Returns all rooms with populated tenant info (name, email, date joined).

#### `PUT /api/rooms/reset-key/:id`
- **Access**: Private (Admin only)
- **Header**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Logic**:
  - Clears assigned tenant.
  - Changes status back to `Vacant`.
  - Generates brand new unique secret key.

#### `GET /api/rooms/validate-key/:key`
- **Access**: Public
- Allows real-time frontend verification before form submission.

---

### 3. Maintenance Issues (`/api/maintenance`)

#### `POST /api/maintenance`
- **Access**: Private (Tenant only)
- **Body**: `{ "title": "Water leakage", "description": "Bathroom tap dripping continuously" }`

#### `GET /api/maintenance`
- **Access**: Private (Admin gets all, Worker gets assigned, Tenant gets own)

#### `PUT /api/maintenance/:id/status`
- **Access**: Private (Admin or assigned Worker)
- **Body**: `{ "status": "In Progress" | "Resolved" }`

#### `PUT /api/maintenance/:id/assign`
- **Access**: Private (Admin only)
- **Body**: `{ "workerId": "<WORKER_OBJECT_ID>" }`
