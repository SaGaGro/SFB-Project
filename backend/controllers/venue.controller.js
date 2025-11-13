import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงสนามทั้งหมด
export const getAllVenues = async (req, res) => {
  try {
    const { type, active } = req.query;
    
    // ตรวจสอบว่าเป็น admin/manager หรือไม่
    const isAdminOrManager = req.user && ['admin', 'manager'].includes(req.user.role);
    
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
    
    // ถ้าไม่ใช่ admin/manager แสดงเฉพาะสนามที่ is_active = 1
    if (!isAdminOrManager) {
      sql += ' AND v.is_active = 1';
    }
    
    if (type) {
      sql += ' AND v.venue_type = ?';
      params.push(type);
    }
    
    // ถ้ามีการระบุ active parameter และเป็น admin/manager ให้ filter ตามที่ระบุ
    if (active !== undefined && isAdminOrManager) {
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
    
    // ตรวจสอบว่าเป็น admin/manager หรือไม่
    const isAdminOrManager = req.user && ['admin', 'manager'].includes(req.user.role);
    
    let sql = `
      SELECT 
        v.*,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM venues v
      LEFT JOIN reviews r ON v.venue_id = r.venue_id
      WHERE v.venue_id = ?
    `;
    
    // ถ้าไม่ใช่ admin/manager แสดงเฉพาะสนามที่ is_active = 1
    if (!isAdminOrManager) {
      sql += ' AND v.is_active = 1';
    }
    
    sql += ' GROUP BY v.venue_id';
    
    const venues = await query(sql, [id]);
    
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
    let equipmentSql = 'SELECT * FROM equipment WHERE venue_id = ?';
    
    // ถ้าไม่ใช่ admin/manager แสดงเฉพาะอุปกรณ์ที่ is_active = 1
    if (!isAdminOrManager) {
      equipmentSql += ' AND is_active = 1';
    }
    
    const equipment = await query(equipmentSql, [id]);

    // ดึงรูปภาพของแต่ละอุปกรณ์
    for (let item of equipment) {
      const equipmentImages = await query(
        'SELECT image_url FROM equipment_images WHERE equipment_id = ?',
        [item.equipment_id]
      );
      item.images = equipmentImages.map(img => img.image_url);
    }

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
      is_active = 1, // 🆕 เพิ่ม is_active (default = 1)
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
        `INSERT INTO venues (venue_name, venue_type, location, description, opening_time, closing_time, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [venue_name, venue_type, location, description, opening_time, closing_time, is_active]
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

// แก้ไขฟังก์ชัน updateVenue
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
      is_active,
      images
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
    
    if (updateFields.length === 0 && !images) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }
    
    // อัพเดทรูปภาพถ้ามีการส่งมา
    if (images !== undefined) {
      await transaction(async (conn) => {
        // อัพเดทข้อมูลสนาม (ถ้ามี)
        if (updateFields.length > 0) {
          params.push(id);
          await conn.execute(
            `UPDATE venues SET ${updateFields.join(', ')} WHERE venue_id = ?`,
            params
          );
        }
        
        // ลบรูปภาพเก่าทั้งหมด
        await conn.execute(
          'DELETE FROM venue_images WHERE venue_id = ?',
          [id]
        );
        
        // เพิ่มรูปภาพใหม่
        if (images.length > 0) {
          for (const imageUrl of images) {
            await conn.execute(
              'INSERT INTO venue_images (venue_id, image_url) VALUES (?, ?)',
              [id, imageUrl]
            );
          }
        }
      });
    } else if (updateFields.length > 0) {
      // อัพเดทเฉพาะข้อมูลสนาม
      params.push(id);
      await query(
        `UPDATE venues SET ${updateFields.join(', ')} WHERE venue_id = ?`,
        params
      );
    }
    
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

// Toggle สถานะการใช้งานสนาม
export const toggleVenueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ดึงสถานะปัจจุบัน
    const venues = await query(
      'SELECT is_active FROM venues WHERE venue_id = ?',
      [id]
    );
    
    if (venues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสนามที่ต้องการ'
      });
    }
    
    // สลับสถานะ
    const newStatus = venues[0].is_active === 1 ? 0 : 1;
    
    await query(
      'UPDATE venues SET is_active = ? WHERE venue_id = ?',
      [newStatus, id]
    );
    
    // Log activity
    await logActivity(
      req.user.user_id, 
      newStatus === 1 ? 'ACTIVATE_VENUE' : 'DEACTIVATE_VENUE', 
      'venues', 
      id
    );
    
    res.json({
      success: true,
      message: newStatus === 1 ? 'เปิดใช้งานสนามสำเร็จ' : 'ปิดใช้งานสนามสำเร็จ',
      data: { is_active: newStatus }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะสนาม',
      error: error.message
    });
  }
};

// ลบสนาม (เก็บไว้สำหรับ admin เท่านั้น)
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