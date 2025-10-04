import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงคอร์ททั้งหมด
export const getAllCourts = async (req, res) => {
  try {
    const { venueId, status } = req.query;
    
    let sql = `
      SELECT 
        c.*,
        v.venue_name,
        v.venue_type
      FROM courts c
      LEFT JOIN venues v ON c.venue_id = v.venue_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (venueId) {
      sql += ' AND c.venue_id = ?';
      params.push(venueId);
    }
    
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY c.court_id';
    
    const courts = await query(sql, params);
    
    res.json({
      success: true,
      count: courts.length,
      data: courts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ท',
      error: error.message
    });
  }
};

// ดึงคอร์ทตาม ID
export const getCourtById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courts = await query(`
      SELECT 
        c.*,
        v.venue_name,
        v.venue_type,
        v.opening_time,
        v.closing_time
      FROM courts c
      LEFT JOIN venues v ON c.venue_id = v.venue_id
      WHERE c.court_id = ?
    `, [id]);
    
    if (courts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคอร์ทที่ต้องการ'
      });
    }
    
    // ดึงรูปภาพ
    const images = await query(
      'SELECT image_url FROM court_images WHERE court_id = ?',
      [id]
    );
    
    const court = {
      ...courts[0],
      images: images.map(img => img.image_url)
    };
    
    res.json({
      success: true,
      data: court
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ท',
      error: error.message
    });
  }
};

// ดึง Time Slots ที่ว่าง
export const getAvailableSlots = async (req, res) => {
  try {
    const { courtId, date } = req.query;
    
    if (!courtId || !date) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ courtId และ date'
      });
    }
    
    // ดึงการจองที่มีอยู่แล้ว
    const bookedSlots = await query(`
      SELECT start_time, end_time
      FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('pending', 'confirmed', 'paid')
      ORDER BY start_time
    `, [courtId, date]);
    
    // ดึงเวลาเปิด-ปิดของสนาม
    const courts = await query(`
      SELECT v.opening_time, v.closing_time
      FROM courts c
      LEFT JOIN venues v ON c.venue_id = v.venue_id
      WHERE c.court_id = ?
    `, [courtId]);
    
    if (courts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคอร์ท'
      });
    }
    
    res.json({
      success: true,
      data: {
        opening_time: courts[0].opening_time,
        closing_time: courts[0].closing_time,
        booked_slots: bookedSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Time Slots',
      error: error.message
    });
  }
};

// สร้างคอร์ทใหม่
export const createCourt = async (req, res) => {
  try {
    const {
      venue_id,
      court_name,
      hourly_rate,
      capacity,
      images = []
    } = req.body;
    
    if (!venue_id || !court_name || !hourly_rate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await transaction(async (conn) => {
      // สร้างคอร์ท
      const [courtResult] = await conn.execute(
        `INSERT INTO courts (venue_id, court_name, hourly_rate, capacity)
         VALUES (?, ?, ?, ?)`,
        [venue_id, court_name, hourly_rate, capacity]
      );
      
      const courtId = courtResult.insertId;
      
      // เพิ่มรูปภาพ (ถ้ามี)
      if (images.length > 0) {
        for (const imageUrl of images) {
          await conn.execute(
            'INSERT INTO court_images (court_id, image_url) VALUES (?, ?)',
            [courtId, imageUrl]
          );
        }
      }
      
      return courtId;
    });
    
    // Log activity
    await logActivity(req.user.user_id, 'CREATE_COURT', 'courts', result);
    
    res.status(201).json({
      success: true,
      message: 'สร้างคอร์ทสำเร็จ',
      data: { courtId: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างคอร์ท',
      error: error.message
    });
  }
};

// แก้ไขคอร์ท
export const updateCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const { court_name, status, hourly_rate, capacity } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (court_name !== undefined) {
      updateFields.push('court_name = ?');
      params.push(court_name);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (hourly_rate !== undefined) {
      updateFields.push('hourly_rate = ?');
      params.push(hourly_rate);
    }
    if (capacity !== undefined) {
      updateFields.push('capacity = ?');
      params.push(capacity);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }
    
    params.push(id);
    
    await query(
      `UPDATE courts SET ${updateFields.join(', ')} WHERE court_id = ?`,
      params
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_COURT', 'courts', id);
    
    res.json({
      success: true,
      message: 'แก้ไขคอร์ทสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขคอร์ท',
      error: error.message
    });
  }
};

// ลบคอร์ท
export const deleteCourt = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM courts WHERE court_id = ?', [id]);
    
    // Log activity
    await logActivity(req.user.user_id, 'DELETE_COURT', 'courts', id);
    
    res.json({
      success: true,
      message: 'ลบคอร์ทสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบคอร์ท',
      error: error.message
    });
  }
};