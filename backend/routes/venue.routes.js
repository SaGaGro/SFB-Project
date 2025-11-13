import express from 'express';
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  toggleVenueStatus,
  deleteVenue
} from '../controllers/venue.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes - ดูได้ทุกคน แต่เห็นเฉพาะ is_active = 1
router.get('/', getAllVenues);
router.get('/:id', getVenueById);

// Admin/Manager only
router.post('/', authenticate, authorize('admin', 'manager'), createVenue);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateVenue);
router.patch('/:id/toggle', authenticate, authorize('admin', 'manager'), toggleVenueStatus);

// Admin only - Hard delete (ควรใช้เฉพาะกรณีจำเป็นจริงๆ)
router.delete('/:id', authenticate, authorize('admin'), deleteVenue);

export default router;