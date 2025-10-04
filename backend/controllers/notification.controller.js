import { query } from '../config/database.js';

// ดึงการแจ้งเตือนของผู้ใช้
export const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { type, is_read, limit = 50 } = req.query;
    
    let sql = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
    `;
    
    const params = [user_id];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    if (is_read !== undefined) {
      sql += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const notifications = await query(sql, params);
    
    // นับจำนวนที่ยังไม่ได้อ่าน
    const unreadCount = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [user_id]
    );
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: unreadCount[0].count,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน',
      error: error.message
    });
  }
};

// อ่านการแจ้งเตือน
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    
    await query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [id, user_id]
    );
    
    res.json({
      success: true,
      message: 'อ่านการแจ้งเตือนแล้ว'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    });
  }
};

// อ่านทั้งหมด
export const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    
    await query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [user_id]
    );
    
    res.json({
      success: true,
      message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    });
  }
};

// ลบการแจ้งเตือน
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    
    await query(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [id, user_id]
    );
    
    res.json({
      success: true,
      message: 'ลบการแจ้งเตือนสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    });
  }
};

// สร้างการแจ้งเตือน (Admin only)
export const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type = 'system' } = req.body;
    
    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [user_id, title, message, type]);
    
    res.status(201).json({
      success: true,
      message: 'สร้างการแจ้งเตือนสำเร็จ',
      data: { notificationId: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: error.message
    });
  }
};