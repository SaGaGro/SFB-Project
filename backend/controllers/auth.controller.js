import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { logActivity } from '../utils/logger.js';

// ลงทะเบียน
export const register = async (req, res) => {
  try {
    const { username, email, password, phone, role = 'member' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ตรวจสอบว่า email หรือ username ซ้ำหรือไม่
    const existing = await query(
      'SELECT email, username FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้นี้มีในระบบแล้ว'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone, role]
    );

    // Log activity
    await logActivity(result.insertId, 'USER_REGISTER', 'users', result.insertId);

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        userId: result.insertId,
        username,
        email,
        role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
      error: error.message
    });
  }
};

// เข้าสู่ระบบ
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      });
    }

    // ค้นหา user (ดึง profile_image ด้วย)
    const users = await query(
      'SELECT user_id, username, email, password_hash, phone, role, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const user = users[0];

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // สร้าง JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role
    });

    // Log activity
    await logActivity(user.user_id, 'USER_LOGIN', 'users', user.user_id);

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          userId: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile_image: user.profile_image  // ✅ เพิ่มบรรทัดนี้
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: error.message
    });
  }
};

// ดึงข้อมูลตัวเอง
export const getMe = async (req, res) => {
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
};

// เปลี่ยนรหัสผ่าน
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ดึงข้อมูล user
    const users = await query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }

    // ตรวจสอบรหัสผ่านเก่า
    const isMatch = await bcrypt.compare(oldPassword, users[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านเก่าไม่ถูกต้อง'
      });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    // Log activity
    await logActivity(userId, 'CHANGE_PASSWORD', 'users', userId);

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      error: error.message
    });
  }
};