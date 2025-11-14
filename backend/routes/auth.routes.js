import express from 'express';
import {
  register,
  login,
  getMe,
  logout, // 1. เพิ่ม logout
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // 2. เพิ่ม route นี้

// Protected routes
router.get('/me', authenticate, getMe);
// router.put('/change-password', authenticate, changePassword);

export default router;