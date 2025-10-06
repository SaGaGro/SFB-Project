import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

const router = express.Router();

// User can view and update their own profile (ต้องมาก่อน /:id route)
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { username, phone, profile_image } = req.body;
    const userId = req.user.user_id;

    const updateFields = [];
    const params = [];

    if (username !== undefined) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(phone);
    }
    if (profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      params.push(profile_image);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }

    params.push(userId);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      params
    );

    // Log activity
    await logActivity(userId, 'UPDATE_PROFILE', 'users', userId);

    // ดึงข้อมูลใหม่
    const users = await query(
      'SELECT user_id, username, email, role, phone, profile_image FROM users WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ',
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
      error: error.message
    });
  }
});

// Admin only routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllUsers);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Routes ที่ต้องเช็คสิทธิ์
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);

export default router;