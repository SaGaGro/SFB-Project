import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

// Middleware ตรวจสอบว่า login หรือยัง
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // ดึงข้อมูล user จาก database (รวม profile_image)
    const users = await query(
      'SELECT user_id, username, email, role, phone, profile_image FROM users WHERE user_id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      error: error.message
    });
  }
};

// Middleware ตรวจสอบ role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้'
      });
    }

    next();
  };
};

// Middleware สำหรับ optional authentication (ไม่ต้อง login ก็ได้)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      const users = await query(
        'SELECT user_id, username, email, role, profile_image FROM users WHERE user_id = ?',
        [decoded.userId]
      );
      
      if (users.length > 0) {
        req.user = users[0];
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};