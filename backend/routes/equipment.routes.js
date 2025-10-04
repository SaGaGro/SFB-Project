import express from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
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
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteEquipment);

export default router;