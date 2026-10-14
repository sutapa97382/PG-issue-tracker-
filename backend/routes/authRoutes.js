import express from 'express';
import {
  tenantSignup,
  adminSignup,
  login,
  createWorker,
  getMe,
  getWorkers,
} from '../controllers/authController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with brute-force rate limiting
router.post('/tenant-signup', authLimiter, tenantSignup);
router.post('/admin-signup', authLimiter, adminSignup);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', authMiddleware, getMe);

// Admin-only routes
router.post('/create-worker', authMiddleware, isAdmin, createWorker);
router.get('/workers', authMiddleware, isAdmin, getWorkers);

export default router;
