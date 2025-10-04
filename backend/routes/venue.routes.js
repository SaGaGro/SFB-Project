import express from 'express';
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} from '../controllers/venue.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllVenues);
router.get('/:id', getVenueById);

// Protected routes (admin/manager only)
router.post('/', authenticate, authorize('admin', 'manager'), createVenue);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateVenue);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteVenue);

export default router;