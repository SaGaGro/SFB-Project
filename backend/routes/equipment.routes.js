import express from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  toggleEquipmentStatus,
  deleteEquipment
} from '../controllers/equipment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllEquipment);
router.get('/:id', getEquipmentById);

// Admin/Manager only
router.post('/', authenticate, authorize('admin', 'manager'), createEquipment);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateEquipment);
router.patch('/:id/toggle', authenticate, authorize('admin', 'manager'), toggleEquipmentStatus);

// Admin only - Hard delete (ควรใช้เฉพาะกรณีจำเป็นจริงๆ)
router.delete('/:id', authenticate, authorize('admin'), deleteEquipment);

export default router;