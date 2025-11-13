import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// Routes สำหรับ Profile ของตัวเอง
// ============================================
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);
router.delete('/me', authenticate, deleteMyAccount); // ลบบัญชีตัวเอง

// ============================================
// Routes สำหรับจัดการผู้ใช้ (Admin & Manager)
// ============================================
router.get('/', authenticate, authorize('admin', 'manager'), getAllUsers);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole); // Admin only
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteUser); // Admin & Manager

// ============================================
// Routes ที่ต้องเช็คสิทธิ์
// ============================================
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);

export default router;