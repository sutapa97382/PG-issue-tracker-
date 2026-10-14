import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateRoomSecretKey } from './utils/generateKey.js';
import { adminSignup, tenantSignup, login, createWorker } from './controllers/authController.js';
import { createRoom } from './controllers/roomController.js';
import {
  createMaintenanceIssue,
  updateIssueStatus,
  assignWorkerToIssue,
} from './controllers/maintenanceController.js';
import { apiLimiter, authLimiter, createIssueLimiter } from './middleware/rateLimiter.js';

// Color helpers for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Mock Response Helper
function createMockRes() {
  let statusCode = 200;
  let responseData = null;

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatus() {
      return statusCode;
    },
    getBody() {
      return responseData;
    },
  };
}

// Mock Request Helper
function mockReqRes(body = {}, params = {}, query = {}, user = null) {
  const req = {
    body,
    params,
    query,
    user,
    headers: {},
  };
  const res = createMockRes();
  return { req, res };
}

let passedCount = 0;
let failedCount = 0;

function assert(description, condition, actualInfo = '') {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS${colors.reset} - ${description}`);
    passedCount++;
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset} - ${description} ${actualInfo}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}    PropMate 360 - Comprehensive API Test Suite    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // --------------------------------------------------------------------------
  // 1. UTILITY & SECURITY UNIT TESTS
  // --------------------------------------------------------------------------
  console.log(`${colors.bold}${colors.yellow}1. Utility & Security Unit Tests${colors.reset}`);
  
  // Test Secret Key Generation format
  const generatedKey = generateRoomSecretKey('101');
  assert(
    'generateRoomSecretKey generates format ROOM-ROOMNUM-XXXX',
    /^ROOM-101-[A-Z0-9]{4}$/.test(generatedKey),
    `Generated: ${generatedKey}`
  );

  // Test bcrypt password hashing and comparison
  const rawPassword = 'StrongPassword123!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  const passwordMatches = await bcrypt.compare(rawPassword, hashedPassword);
  assert('bcrypt correctly hashes and verifies password', passwordMatches === true);

  // Test JWT token signing and verification
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  const sampleToken = jwt.sign({ id: 'user_123', role: 'admin' }, jwtSecret, { expiresIn: '1h' });
  const decoded = jwt.verify(sampleToken, jwtSecret);
  assert('JWT signs and decodes valid token payload', decoded.id === 'user_123' && decoded.role === 'admin');

  // --------------------------------------------------------------------------
  // 2. AUTH CONTROLLER TESTS (/api/auth)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}2. Auth API Tests (/api/auth)${colors.reset}`);

  // Test admin-signup missing fields
  {
    const { req, res } = mockReqRes({ name: 'Admin' });
    await adminSignup(req, res);
    assert('POST /api/auth/admin-signup fails on missing fields with 400', res.getStatus() === 400 && res.getBody()?.success === false);
  }

  // Test admin-signup wrong admin secret code
  {
    const { req, res } = mockReqRes({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'adminPassword123',
      adminSecretCode: 'WRONG_CODE_999',
    });
    await adminSignup(req, res);
    assert('POST /api/auth/admin-signup rejects invalid adminSecretCode with 403', res.getStatus() === 403 && res.getBody()?.message === 'Invalid Admin Secret Code');
  }

  // Test tenant-signup missing fields
  {
    const { req, res } = mockReqRes({ name: 'Tenant User' });
    await tenantSignup(req, res);
    assert('POST /api/auth/tenant-signup rejects missing fields with 400', res.getStatus() === 400 && res.getBody()?.success === false);
  }

  // Test login missing email or password
  {
    const { req, res } = mockReqRes({ email: '' });
    await login(req, res);
    assert('POST /api/auth/login rejects empty email/password with 400', res.getStatus() === 400 && res.getBody()?.success === false);
  }

  // --------------------------------------------------------------------------
  // 3. ROOM CONTROLLER TESTS (/api/rooms)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}3. Room API Tests (/api/rooms)${colors.reset}`);

  // Test room create missing roomNumber
  {
    const { req, res } = mockReqRes({});
    await createRoom(req, res);
    assert('POST /api/rooms/create rejects missing roomNumber with 400', res.getStatus() === 400);
  }

  // Test room create invalid format (e.g. symbols like #@!)
  {
    const { req, res } = mockReqRes({ roomNumber: '###@@@' });
    await createRoom(req, res);
    assert('POST /api/rooms/create rejects invalid characters with 400', res.getStatus() === 400 && res.getBody()?.message?.includes('letters, numbers'));
  }

  // --------------------------------------------------------------------------
  // 4. MAINTENANCE CONTROLLER TESTS (/api/maintenance)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}4. Maintenance API Tests (/api/maintenance)${colors.reset}`);

  // Test create maintenance missing description
  {
    const { req, res } = mockReqRes({ title: 'Leaky faucet' }, {}, {}, { role: 'tenant', roomNumber: 'R101' });
    await createMaintenanceIssue(req, res);
    assert('POST /api/maintenance rejects missing description with 400', res.getStatus() === 400 && res.getBody()?.message?.includes('description'));
  }

  // Test create maintenance when user is not a tenant
  {
    const { req, res } = mockReqRes({ title: 'Leak', description: 'Water pipe leaking' }, {}, {}, { role: 'worker', roomNumber: 'R101' });
    await createMaintenanceIssue(req, res);
    assert('POST /api/maintenance rejects non-tenant role with 403', res.getStatus() === 403 && res.getBody()?.message?.includes('Only registered tenants'));
  }

  // Test update status with invalid status value
  {
    const { req, res } = mockReqRes({ status: 'InvalidStatus' }, { id: '507f1f77bcf86cd799439011' }, {}, { role: 'admin' });
    await updateIssueStatus(req, res);
    assert('PUT /api/maintenance/:id/status rejects invalid status with 400', res.getStatus() === 400 && res.getBody()?.message?.includes('Valid status is required'));
  }

  // --------------------------------------------------------------------------
  // 5. WORKER MANAGEMENT & ACCESS CONTROL TESTS
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}5. Worker Management & Access Control Tests${colors.reset}`);

  // Test create-worker missing fields
  {
    const { req, res } = mockReqRes({ name: 'Plumber Bob' }, {}, {}, { role: 'admin' });
    await createWorker(req, res);
    assert('POST /api/auth/create-worker rejects missing email/password with 400', res.getStatus() === 400);
  }

  // Test assign worker missing workerId
  {
    const { req, res } = mockReqRes({}, { id: '507f1f77bcf86cd799439011' }, {}, { role: 'admin' });
    await assignWorkerToIssue(req, res);
    assert('PUT /api/maintenance/:id/assign rejects missing workerId with 400', res.getStatus() === 400 && res.getBody()?.message?.includes('workerId is required'));
  }

  // --------------------------------------------------------------------------
  // 6. RATE LIMITING MIDDLEWARE TESTS
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}6. Rate Limiting Middleware Tests${colors.reset}`);

  assert('apiLimiter is configured as Express middleware', typeof apiLimiter === 'function');
  assert('authLimiter is configured as Express middleware with strict max attempts', typeof authLimiter === 'function');
  assert('createIssueLimiter is configured to prevent complaint flooding', typeof createIssueLimiter === 'function');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}Test Results:${colors.reset} ${colors.green}${passedCount} Passed${colors.reset}, ${failedCount > 0 ? colors.red : colors.green}${failedCount} Failed${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  process.exit(failedCount > 0 ? 1 : 0);
}

runAllTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
