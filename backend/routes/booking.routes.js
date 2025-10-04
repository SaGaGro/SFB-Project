import express from 'express';
import {
  getAllBookings,
  getBookingById,
  checkAvailability,
  createBooking,
  cancelBooking,
  updateBookingStatus
} from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', authenticate, getAllBookings);
router.get('/check-availability', checkAvailability);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, createBooking);
router.put('/:id/cancel', authenticate, cancelBooking);

// Admin/Manager only
router.put('/:id/status', authenticate, authorize('admin', 'manager'), updateBookingStatus);

export default router;