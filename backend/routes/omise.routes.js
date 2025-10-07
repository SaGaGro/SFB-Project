import express from 'express';
import {
  createPaymentCharge,
  checkChargeStatus,
  handleWebhook,
} from '../controllers/omise.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/create-charge', authenticate, createPaymentCharge);
router.get('/charge/:charge_id', authenticate, checkChargeStatus);

// Webhook route (no authentication needed)
router.post('/webhook', handleWebhook);

export default router;