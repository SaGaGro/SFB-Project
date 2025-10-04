import express from 'express';
import {
  getAllCourts,
  getCourtById,
  getAvailableSlots,
  createCourt,
  updateCourt,
  deleteCourt
} from '../controllers/court.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourts);
router.get('/available-slots', getAvailableSlots);
router.get('/:id', getCourtById);

// Admin/Manager only
router.post('/', authenticate, authorize('admin', 'manager'), createCourt);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateCourt);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteCourt);

export default router;