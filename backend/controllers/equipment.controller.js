import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงอุปกรณ์ทั้งหมด
export const getAllEquipment = async (req, res) => {
  try {
    const { venueId } = req.query;
    
    let sql = `
      SELECT 
        e.*,
        v.venue_name
      FROM equipment e
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (venueId) {
      sql += ' AND e.venue_id = ?';
      params.push(venueId);
    }
    
    sql += ' ORDER BY e.equipment_name';
    
    const equipment = await query(sql, params);
    
    res.json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์',
      error: error.message
    });
  }
};

// ดึงอุปกรณ์ตาม ID
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = await query(`
      SELECT 
        e.*,
        v.venue_name,
        v.venue_type
      FROM equipment e
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.equipment_id = ?
    `, [id]);
    
    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบอุปกรณ์ที่ต้องการ'
      });
    }
    
    // ดึงรูปภาพ
    const images = await query(
      'SELECT image_url FROM equipment_images WHERE equipment_id = ?',
      [id]
    );
    
    const equipmentData = {
      ...equipment[0],
      images: images.map(img => img.image_url)
    };
    
    res.json({
      success: true,
      data: equipmentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์',
      error: error.message
    });
  }
};

// สร้างอุปกรณ์ใหม่
export const createEquipment = async (req, res) => {
  try {
    const {
      venue_id,
      equipment_name,
      stock,
      rental_price,
      images = []
    } = req.body;
    
    if (!venue_id || !equipment_name || stock === undefined || !rental_price) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await transaction(async (conn) => {
      // สร้างอุปกรณ์
      const [equipmentResult] = await conn.execute(
        `INSERT INTO equipment (venue_id, equipment_name, stock, rental_price)
         VALUES (?, ?, ?, ?)`,
        [venue_id, equipment_name, stock, rental_price]
      );
      
      const equipmentId = equipmentResult.insertId;
      
      // เพิ่มรูปภาพ (ถ้ามี)
      if (images.length > 0) {
        for (const imageUrl of images) {
          await conn.execute(
            'INSERT INTO equipment_images (equipment_id, image_url) VALUES (?, ?)',
            [equipmentId, imageUrl]
          );
        }
      }
      
      return equipmentId;
    });
    
    // Log activity
    await logActivity(req.user.user_id, 'CREATE_EQUIPMENT', 'equipment', result);
    
    res.status(201).json({
      success: true,
      message: 'สร้างอุปกรณ์สำเร็จ',
      data: { equipmentId: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างอุปกรณ์',
      error: error.message
    });
  }
};

// แก้ไขอุปกรณ์
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_name, stock, rental_price } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (equipment_name !== undefined) {
      updateFields.push('equipment_name = ?');
      params.push(equipment_name);
    }
    if (stock !== undefined) {
      updateFields.push('stock = ?');
      params.push(stock);
    }
    if (rental_price !== undefined) {
      updateFields.push('rental_price = ?');
      params.push(rental_price);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }
    
    params.push(id);
    
    await query(
      `UPDATE equipment SET ${updateFields.join(', ')} WHERE equipment_id = ?`,
      params
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_EQUIPMENT', 'equipment', id);
    
    res.json({
      success: true,
      message: 'แก้ไขอุปกรณ์สำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขอุปกรณ์',
      error: error.message
    });
  }
};

// ลบอุปกรณ์
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM equipment WHERE equipment_id = ?', [id]);
    
    // Log activity
    await logActivity(req.user.user_id, 'DELETE_EQUIPMENT', 'equipment', id);
    
    res.json({
      success: true,
      message: 'ลบอุปกรณ์สำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบอุปกรณ์',
      error: error.message
    });
  }
};