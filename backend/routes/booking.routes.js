import express from 'express';
import {
  getAllBookings,
  getBookingById,
  checkAvailability,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  getBookedSlotsByDate,
  checkPaymentStatus,
  updateBooking,
  confirmPaymentManually
} from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllBookings);
router.get('/check-availability', checkAvailability);
router.get('/booked-slots', getBookedSlotsByDate);
router.get('/:id', authenticate, getBookingById);
router.get('/:id/payment-status', authenticate, checkPaymentStatus);
router.post('/', authenticate, createBooking);
router.put('/:id/cancel', authenticate, cancelBooking);
router.put('/:id/status', authenticate, authorize('admin', 'manager'), updateBookingStatus);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateBooking); // Admin/Manager แก้ไขการจอง
router.post('/:id/confirm-payment', authenticate, authorize('admin', 'manager'), confirmPaymentManually); // Admin/Manager ยืนยันชำระเงิน

export default router;