import { query } from '../config/database.js';
import { logActivity } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

// ดึงผู้ใช้ทั้งหมด (Admin & Manager)
// Admin: ดูได้ทุก role
// Manager: ดูได้เฉพาะ member
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const currentUser = req.user;

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

    // Manager สามารถดูได้เฉพาะ member เท่านั้น
    if (currentUser.role === 'manager') {
      sql += ' AND role = ?';
      params.push('member');
    }

    // Filter by role (ถ้ามีการระบุ)
    if (role && currentUser.role === 'admin') {
      sql += ' AND role = ?';
      params.push(role);
    }

    // Search by username or email
    if (search) {
      sql += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const users = await query(sql, params);

    res.json({
      success: true,
      count: users.length,
      data: users,
      userRole: currentUser.role // ส่ง role ของ user ที่ request ไปด้วย
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
// Admin เท่านั้นที่สามารถเปลี่ยน role ได้
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

    // ดึงข้อมูล user ที่จะเปลี่ยน role
    const targetUsers = await query(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [id]
    );

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการ'
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

// ลบผู้ใช้ (Admin & Manager)
// Admin: ลบได้ทุก role ยกเว้นตัวเอง
// Manager: ลบได้เฉพาะ member เท่านั้น
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // ห้ามลบตัวเอง
    if (currentUser.user_id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีตัวเองได้'
      });
    }

    // ดึงข้อมูล user ที่จะลบ
    const targetUsers = await query(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [id]
    );

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการลบ'
      });
    }

    const targetUser = targetUsers[0];

    // Manager สามารถลบได้เฉพาะ member เท่านั้น
    if (currentUser.role === 'manager' && targetUser.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Manager สามารถลบได้เฉพาะบัญชี Member เท่านั้น'
      });
    }

    await query('DELETE FROM users WHERE user_id = ?', [id]);

    // Log activity
    await logActivity(currentUser.user_id, 'DELETE_USER', 'users', id);

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