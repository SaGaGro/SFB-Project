import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงสนามทั้งหมด
export const getAllVenues = async (req, res) => {
  try {
    const { type, active } = req.query;
    
    let sql = `
      SELECT 
        v.*,
        GROUP_CONCAT(DISTINCT vi.image_url) as images,
        COUNT(DISTINCT c.court_id) as court_count,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM venues v
      LEFT JOIN venue_images vi ON v.venue_id = vi.venue_id
      LEFT JOIN courts c ON v.venue_id = c.venue_id
      LEFT JOIN reviews r ON v.venue_id = r.venue_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (type) {
      sql += ' AND v.venue_type = ?';
      params.push(type);
    }
    
    if (active !== undefined) {
      sql += ' AND v.is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    sql += ' GROUP BY v.venue_id ORDER BY v.created_at DESC';
    
    const venues = await query(sql, params);
    
    // แปลง images จาก string เป็น array
    const formattedVenues = venues.map(venue => ({
      ...venue,
      images: venue.images ? venue.images.split(',') : [],
      avg_rating: venue.avg_rating ? parseFloat(venue.avg_rating).toFixed(1) : null
    }));
    
    res.json({
      success: true,
      count: formattedVenues.length,
      data: formattedVenues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสนาม',
      error: error.message
    });
  }
};

// ดึงสนามตาม ID
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venues = await query(`
      SELECT 
        v.*,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM venues v
      LEFT JOIN reviews r ON v.venue_id = r.venue_id
      WHERE v.venue_id = ?
      GROUP BY v.venue_id
    `, [id]);
    
    if (venues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสนามที่ต้องการ'
      });
    }
    
    // ดึงรูปภาพ
    const images = await query(
      'SELECT image_url FROM venue_images WHERE venue_id = ?',
      [id]
    );
    
    // ดึงคอร์ท
    const courts = await query(
      'SELECT * FROM courts WHERE venue_id = ?',
      [id]
    );
    
    // ดึงอุปกรณ์
    const equipment = await query(
      'SELECT * FROM equipment WHERE venue_id = ?',
      [id]
    );
    
    const venue = {
      ...venues[0],
      avg_rating: venues[0].avg_rating ? parseFloat(venues[0].avg_rating).toFixed(1) : null,
      images: images.map(img => img.image_url),
      courts,
      equipment
    };
    
    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสนาม',
      error: error.message
    });
  }
};

// สร้างสนามใหม่
export const createVenue = async (req, res) => {
  try {
    const {
      venue_name,
      venue_type,
      location,
      description,
      opening_time,
      closing_time,
      images = []
    } = req.body;
    
    if (!venue_name || !venue_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await transaction(async (conn) => {
      // สร้างสนาม
      const [venueResult] = await conn.execute(
        `INSERT INTO venues (venue_name, venue_type, location, description, opening_time, closing_time)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [venue_name, venue_type, location, description, opening_time, closing_time]
      );
      
      const venueId = venueResult.insertId;
      
      // เพิ่มรูปภาพ (ถ้ามี)
      if (images.length > 0) {
        for (const imageUrl of images) {
          await conn.execute(
            'INSERT INTO venue_images (venue_id, image_url) VALUES (?, ?)',
            [venueId, imageUrl]
          );
        }
      }
      
      return venueId;
    });
    
    // Log activity
    await logActivity(req.user.user_id, 'CREATE_VENUE', 'venues', result);
    
    res.status(201).json({
      success: true,
      message: 'สร้างสนามสำเร็จ',
      data: { venueId: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างสนาม',
      error: error.message
    });
  }
};

// แก้ไขสนาม
export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      venue_name,
      venue_type,
      location,
      description,
      opening_time,
      closing_time,
      is_active
    } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (venue_name !== undefined) {
      updateFields.push('venue_name = ?');
      params.push(venue_name);
    }
    if (venue_type !== undefined) {
      updateFields.push('venue_type = ?');
      params.push(venue_type);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      params.push(location);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (opening_time !== undefined) {
      updateFields.push('opening_time = ?');
      params.push(opening_time);
    }
    if (closing_time !== undefined) {
      updateFields.push('closing_time = ?');
      params.push(closing_time);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }
    
    params.push(id);
    
    await query(
      `UPDATE venues SET ${updateFields.join(', ')} WHERE venue_id = ?`,
      params
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_VENUE', 'venues', id);
    
    res.json({
      success: true,
      message: 'แก้ไขสนามสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขสนาม',
      error: error.message
    });
  }
};

// ลบสนาม
export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM venues WHERE venue_id = ?', [id]);
    
    // Log activity
    await logActivity(req.user.user_id, 'DELETE_VENUE', 'venues', id);
    
    res.json({
      success: true,
      message: 'ลบสนามสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสนาม',
      error: error.message
    });
  }
};