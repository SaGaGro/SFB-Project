import { query } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงรีวิวทั้งหมด
export const getAllReviews = async (req, res) => {
  try {
    const { venueId, userId, rating } = req.query;
    
    let sql = `
      SELECT 
        r.*,
        u.username,
        u.profile_image,
        v.venue_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN venues v ON r.venue_id = v.venue_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (venueId) {
      sql += ' AND r.venue_id = ?';
      params.push(venueId);
    }
    
    if (userId) {
      sql += ' AND r.user_id = ?';
      params.push(userId);
    }
    
    if (rating) {
      sql += ' AND r.rating = ?';
      params.push(rating);
    }
    
    sql += ' ORDER BY r.created_at DESC';
    
    const reviews = await query(sql, params);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว',
      error: error.message
    });
  }
};

// สร้างรีวิว
export const createReview = async (req, res) => {
  try {
    const { venue_id, rating, comment } = req.body;
    const user_id = req.user.user_id;
    
    if (!venue_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสนามและคะแนน'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'คะแนนต้องอยู่ระหว่าง 1-5'
      });
    }
    
    // ตรวจสอบว่าเคยจองสนามนี้และชำระเงินแล้วหรือยัง
    const bookings = await query(`
      SELECT * FROM bookings
      WHERE user_id = ? AND venue_id = ? AND status = 'paid'
      LIMIT 1
    `, [user_id, venue_id]);
    
    if (bookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'คุณต้องใช้บริการสนามนี้ก่อนจึงจะรีวิวได้'
      });
    }
    
    // ตรวจสอบว่าเคยรีวิวแล้วหรือยัง
    const existingReviews = await query(`
      SELECT * FROM reviews
      WHERE user_id = ? AND venue_id = ?
    `, [user_id, venue_id]);
    
    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'คุณได้รีวิวสนามนี้แล้ว'
      });
    }
    
    const result = await query(`
      INSERT INTO reviews (user_id, venue_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [user_id, venue_id, rating, comment]);
    
    // Log activity
    await logActivity(user_id, 'CREATE_REVIEW', 'reviews', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'สร้างรีวิวสำเร็จ',
      data: { reviewId: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรีวิว',
      error: error.message
    });
  }
};

// แก้ไขรีวิว
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.user_id;
    
    // ตรวจสอบว่าเป็นรีวิวของตัวเองหรือไม่
    const reviews = await query(
      'SELECT * FROM reviews WHERE review_id = ? AND user_id = ?',
      [id, user_id]
    );
    
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบรีวิวหรือคุณไม่มีสิทธิ์แก้ไข'
      });
    }
    
    const updateFields = [];
    const params = [];
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'คะแนนต้องอยู่ระหว่าง 1-5'
        });
      }
      updateFields.push('rating = ?');
      params.push(rating);
    }
    
    if (comment !== undefined) {
      updateFields.push('comment = ?');
      params.push(comment);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }
    
    params.push(id);
    
    await query(
      `UPDATE reviews SET ${updateFields.join(', ')} WHERE review_id = ?`,
      params
    );
    
    // Log activity
    await logActivity(user_id, 'UPDATE_REVIEW', 'reviews', id);
    
    res.json({
      success: true,
      message: 'แก้ไขรีวิวสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว',
      error: error.message
    });
  }
};

// ลบรีวิว
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const isAdmin = req.user.role === 'admin';
    
    // Admin ลบได้หมด, user ลบได้เฉพาะของตัวเอง
    let sql = 'DELETE FROM reviews WHERE review_id = ?';
    const params = [id];
    
    if (!isAdmin) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    
    const result = await query(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบรีวิวหรือคุณไม่มีสิทธิ์ลบ'
      });
    }
    
    // Log activity
    await logActivity(user_id, 'DELETE_REVIEW', 'reviews', id);
    
    res.json({
      success: true,
      message: 'ลบรีวิวสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบรีวิว',
      error: error.message
    });
  }
};