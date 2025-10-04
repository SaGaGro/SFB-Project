import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllUsers);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// User can view and update their own profile
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);

export default router;