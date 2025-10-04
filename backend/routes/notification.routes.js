import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// Admin only
router.post('/', authenticate, authorize('admin', 'manager'), createNotification);

export default router;