import express from 'express';
import {
  createPayment,
  confirmPayment,
  getPayments,
  getPaymentById
} from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authenticate, createPayment);
router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPaymentById);

// Admin/Manager only
router.put('/:id/confirm', authenticate, authorize('admin', 'manager'), confirmPayment);

export default router;