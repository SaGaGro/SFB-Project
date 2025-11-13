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

// Protected routes
// ❗️ เปลี่ยน: 'admin' เท่านั้นที่สร้างได้ (จากเดิม 'admin', 'manager')
router.post('/', authenticate, authorize('admin'), createVenue);

// ❗️ คงเดิม: 'admin' และ 'manager' ยังคงอัปเดตได้
router.put('/:id', authenticate, authorize('admin', 'manager'), updateVenue);

// ❗️ เปลี่ยน: 'admin' เท่านั้นที่ลบได้ (จากเดิม 'admin', 'manager')
router.delete('/:id', authenticate, authorize('admin'), deleteVenue);

export default router;