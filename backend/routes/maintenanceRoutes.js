import express from 'express';
import {
  createMaintenanceIssue,
  getMaintenanceIssues,
  updateIssueStatus,
  assignWorkerToIssue,
} from '../controllers/maintenanceController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { createIssueLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Tenant creates with spam rate limiting, everyone authenticated can view their relevant tickets
router.post('/', authMiddleware, createIssueLimiter, createMaintenanceIssue);
router.get('/', authMiddleware, getMaintenanceIssues);

// Status update (Admin or assigned worker)
router.put('/:id/status', authMiddleware, updateIssueStatus);

// Assign worker to problem (Admin only)
router.put('/:id/assign', authMiddleware, isAdmin, assignWorkerToIssue);

export default router;
