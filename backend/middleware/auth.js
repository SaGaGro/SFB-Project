import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

// Middleware ตรวจสอบว่า login หรือยัง
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // 🆕 รับ token จาก 2 แหล่ง: Cookie (สำหรับ Browser) หรือ Header (สำหรับ Postman/API)
    if (req.cookies && req.cookies.token) {
      // จาก Cookie
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // จาก Authorization header
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

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
    let token;
    
    // 🆕 รับ token จาก 2 แหล่ง
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
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