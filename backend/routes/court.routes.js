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

// Protected routes
// ❗️ เปลี่ยน: 'admin' เท่านั้นที่สร้างได้ (จากเดิม 'admin', 'manager')
router.post('/', authenticate, authorize('admin'), createCourt);

// ❗️ คงเดิม: 'admin' และ 'manager' ยังคงอัปเดตได้
router.put('/:id', authenticate, authorize('admin', 'manager'), updateCourt);

// ❗️ เปลี่ยน: 'admin' เท่านั้นที่ลบได้ (จากเดิม 'admin', 'manager')
router.delete('/:id', authenticate, authorize('admin'), deleteCourt);

export default router;