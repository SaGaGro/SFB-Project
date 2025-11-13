import { query } from '../config/database.js';
import { logActivity } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

// ดึงข้อมูล Profile ของตัวเอง
export const getMyProfile = async (req, res) => {
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

// อัพเดท Profile ของตัวเอง
export const updateMyProfile = async (req, res) => {
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
};

// ลบบัญชีของตัวเอง (Soft Delete)
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // ⭐️ ไม่ต้องรับ password จาก req.body

    // ⭐️ ดึงข้อมูล user (เอาแค่ email เพื่อใช้ตอน soft delete)
    const users = await query(
      'SELECT user_id, email FROM users WHERE user_id = ? AND is_active = 1', // เอา password ออก
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัญชีผู้ใช้'
      });
    }

    const user = users[0];

    // ⭐️ ไม่ต้องตรวจสอบรหัสผ่าน

    // Soft Delete: เก็บ email เดิมไว้และตั้งค่า is_active = 0
    await query(
      'UPDATE users SET is_active = 0, email = NULL, deleted_email = ?, deleted_at = NOW() WHERE user_id = ?',
      [user.email, userId]
    );

    // Log activity
    await logActivity(userId, 'DELETE_MY_ACCOUNT', 'users', userId);

    res.json({
      success: true,
      message: 'ลบบัญชีสำเร็จ กรุณา Logout'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบบัญชี',
      error: error.message
    });
  }
};

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
      AND is_active = 1
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
      userRole: currentUser.role
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
      AND is_active = 1
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
    
    // ตรวจสอบว่า user ที่จะแก้ยังมี is_active = 1
    const targetUser = await query('SELECT 1 FROM users WHERE user_id = ? AND is_active = 1', [id]);
    if (targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' });
    }

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

    // ตรวจสอบว่า user ที่จะแก้ยังมี is_active = 1
    const targetUsers = await query(
      'SELECT user_id, role FROM users WHERE user_id = ? AND is_active = 1',
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

// ⭐️ ============================================
// ⭐️ ADDED: รีเซ็ตรหัสผ่านโดย Admin/Manager
// ⭐️ ============================================
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params; // ID ของ user ที่จะรีเซ็ต
    const { newPassword } = req.body;
    const currentUser = req.user; // Admin หรือ Manager ที่กำลังล็อกอิน

    if (!newPassword || newPassword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสผ่านใหม่'
      });
    }

    // ดึงข้อมูล user ที่จะรีเซ็ต
    const targetUsers = await query(
      'SELECT user_id, role, is_active FROM users WHERE user_id = ?',
      [id]
    );

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน'
      });
    }

    const targetUser = targetUsers[0];

    // ตรวจสอบว่าบัญชียัง active อยู่หรือไม่
    if (targetUser.is_active === 0) {
      return res.status(400).json({
        success: false,
        message: 'บัญชีนี้ถูกปิดการใช้งาน'
      });
    }

    // ตรวจสอบสิทธิ์
    // Manager สามารถรีเซ็ตได้เฉพาะรหัสผ่านของ member เท่านั้น
    if (currentUser.role === 'manager' && targetUser.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Manager สามารถรีเซ็ตรหัสผ่านได้เฉพาะบัญชี Member เท่านั้น'
      });
    }

    // (Admin สามารถรีเซ็ตได้ทุกคนที่ผ่าน middleware มา)

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, id]
    );

    // Log activity
    await logActivity(currentUser.user_id, 'RESET_USER_PASSWORD', 'users', id);

    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
      error: error.message
    });
  }
};


// ลบผู้ใช้ (Soft Delete)
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
      'SELECT user_id, role, email FROM users WHERE user_id = ? AND is_active = 1',
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

    // Soft Delete: เก็บ email เดิมไว้และตั้งค่า is_active = 0
    await query(
      'UPDATE users SET is_active = 0, email = NULL, deleted_email = ?, deleted_at = NOW() WHERE user_id = ?', 
      [targetUser.email, id]
    );

    // Log activity
    await logActivity(currentUser.user_id, 'DELETE_USER', 'users', id);

    res.json({
      success: true,
      message: 'ปิดการใช้งานผู้ใช้สำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
      error: error.message
    });
  }
};