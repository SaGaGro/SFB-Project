import { query } from '../config/database.js';
import { logActivity } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

// ดึงผู้ใช้ทั้งหมด (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let sql = `
      SELECT 
        user_id,
        username,
        email,
        phone,
        role,
        profile_image,
        created_at
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      sql += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const users = await query(sql, params);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// ดึงผู้ใช้ตาม ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await query(`
      SELECT 
        user_id,
        username,
        email,
        phone,
        role,
        profile_image,
        created_at
      FROM users
      WHERE user_id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการ'
      });
    }
    
    // ดึงสถิติการจอง
    const bookingStats = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as total_spent
      FROM bookings
      WHERE user_id = ?
    `, [id]);
    
    const user = {
      ...users[0],
      stats: bookingStats[0]
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// อัพเดทข้อมูลผู้ใช้
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phone, profile_image } = req.body;
    
    // ตรวจสอบสิทธิ์ (ต้องเป็นตัวเองหรือ admin)
    if (req.user.user_id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้นี้'
      });
    }
    
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
    
    params.push(id);
    
    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      params
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_USER', 'users', id);
    
    res.json({
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
      error: error.message
    });
  }
};

// เปลี่ยน role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['admin', 'manager', 'member'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role ไม่ถูกต้อง'
      });
    }
    
    await query(
      'UPDATE users SET role = ? WHERE user_id = ?',
      [role, id]
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_USER_ROLE', 'users', id);
    
    res.json({
      success: true,
      message: 'เปลี่ยน role สำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยน role',
      error: error.message
    });
  }
};

// ลบผู้ใช้ (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ห้ามลบตัวเอง
    if (req.user.user_id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีตัวเองได้'
      });
    }
    
    await query('DELETE FROM users WHERE user_id = ?', [id]);
    
    // Log activity
    await logActivity(req.user.user_id, 'DELETE_USER', 'users', id);
    
    res.json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
      error: error.message
    });
  }
};