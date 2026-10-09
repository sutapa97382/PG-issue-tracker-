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

const router = express.Router();

// Public routes
router.post('/tenant-signup', tenantSignup);
router.post('/admin-signup', adminSignup);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);

// Admin-only routes
router.post('/create-worker', authMiddleware, isAdmin, createWorker);
router.get('/workers', authMiddleware, isAdmin, getWorkers);

export default router;
