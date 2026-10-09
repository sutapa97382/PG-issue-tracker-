import express from 'express';
import {
  createRoom,
  getAllRooms,
  resetRoomKey,
  deleteRoom,
  validateRoomKey,
} from '../controllers/roomController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public helper to validate room key prior to tenant signup
router.get('/validate-key/:key', validateRoomKey);

// Protected Admin-only routes
router.post('/create', authMiddleware, isAdmin, createRoom);
router.get('/all', authMiddleware, isAdmin, getAllRooms);
router.put('/reset-key/:id', authMiddleware, isAdmin, resetRoomKey);
router.delete('/:id', authMiddleware, isAdmin, deleteRoom);

export default router;
