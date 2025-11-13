import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ฟังก์ชันลบไฟล์รูปภาพ
const deleteImageFile = (imageUrl) => {
  try {
    if (!imageUrl) return;

    // แปลง URL เป็น path (/uploads/equipment/filename.jpg -> backend/uploads/equipment/filename.jpg)
    const relativePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    // __dirname = backend/controllers -> ไปที่ backend/ แล้วต่อด้วย relativePath
    const filePath = path.join(__dirname, '../', relativePath);

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${imageUrl}:`, error.message);
  }
};

// ดึงอุปกรณ์ทั้งหมด
export const getAllEquipment = async (req, res) => {
  try {
    const { venueId } = req.query;
    
    // ตรวจสอบว่าเป็น admin/manager หรือไม่
    const isAdminOrManager = req.user && ['admin', 'manager'].includes(req.user.role);

    let sql = `
      SELECT
        e.*,
        v.venue_name
      FROM equipment e
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE 1=1
    `;

    const params = [];
    
    // ถ้าไม่ใช่ admin/manager แสดงเฉพาะอุปกรณ์ที่ is_active = 1
    if (!isAdminOrManager) {
      sql += ' AND e.is_active = 1';
    }

    if (venueId) {
      sql += ' AND e.venue_id = ?';
      params.push(venueId);
    }

    sql += ' ORDER BY e.equipment_name';

    const equipment = await query(sql, params);

    // ดึงรูปภาพของแต่ละอุปกรณ์
    for (let item of equipment) {
      const images = await query(
        'SELECT image_url FROM equipment_images WHERE equipment_id = ?',
        [item.equipment_id]
      );
      item.images = images.map(img => img.image_url);
    }

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
    
    // ตรวจสอบว่าเป็น admin/manager หรือไม่
    const isAdminOrManager = req.user && ['admin', 'manager'].includes(req.user.role);
    
    let sql = `
      SELECT 
        e.*,
        v.venue_name,
        v.venue_type
      FROM equipment e
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.equipment_id = ?
    `;
    
    // ถ้าไม่ใช่ admin/manager แสดงเฉพาะอุปกรณ์ที่ is_active = 1
    if (!isAdminOrManager) {
      sql += ' AND e.is_active = 1';
    }
    
    const equipment = await query(sql, [id]);
    
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
      is_active = 1,
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
        `INSERT INTO equipment (venue_id, equipment_name, stock, rental_price, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [venue_id, equipment_name, stock, rental_price, is_active]
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
    const { equipment_name, stock, rental_price, is_active, images = [] } = req.body;

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
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(is_active);
    }

    if (updateFields.length === 0 && images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่ต้องการแก้ไข'
      });
    }

    await transaction(async (conn) => {
      // Update equipment info
      if (updateFields.length > 0) {
        params.push(id);
        await conn.execute(
          `UPDATE equipment SET ${updateFields.join(', ')} WHERE equipment_id = ?`,
          params
        );
      }

      // Update images if provided
      if (images.length > 0) {
        // ดึงรูปเดิมก่อนลบ
        const [oldImages] = await conn.execute(
          'SELECT image_url FROM equipment_images WHERE equipment_id = ?',
          [id]
        );

        // หารูปที่ถูกลบ (รูปเดิมที่ไม่อยู่ใน list ใหม่)
        const oldImageUrls = oldImages.map(img => img.image_url);
        const deletedImages = oldImageUrls.filter(oldUrl => !images.includes(oldUrl));

        // ลบเฉพาะไฟล์รูปที่ถูกลบออกจาก list
        for (const imageUrl of deletedImages) {
          deleteImageFile(imageUrl);
        }

        // ลบรูปเดิมทั้งหมดจาก database
        await conn.execute(
          'DELETE FROM equipment_images WHERE equipment_id = ?',
          [id]
        );

        // เพิ่มรูปใหม่ทั้งหมด (รวมรูปเก่าที่ยังต้องการเก็บ)
        for (const imageUrl of images) {
          await conn.execute(
            'INSERT INTO equipment_images (equipment_id, image_url) VALUES (?, ?)',
            [id, imageUrl]
          );
        }
      }
    });

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

// Toggle สถานะการใช้งานอุปกรณ์
export const toggleEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ดึงสถานะปัจจุบัน
    const equipment = await query(
      'SELECT is_active FROM equipment WHERE equipment_id = ?',
      [id]
    );
    
    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบอุปกรณ์ที่ต้องการ'
      });
    }
    
    // สลับสถานะ
    const newStatus = equipment[0].is_active === 1 ? 0 : 1;
    
    await query(
      'UPDATE equipment SET is_active = ? WHERE equipment_id = ?',
      [newStatus, id]
    );
    
    // Log activity
    await logActivity(
      req.user.user_id, 
      newStatus === 1 ? 'ACTIVATE_EQUIPMENT' : 'DEACTIVATE_EQUIPMENT', 
      'equipment', 
      id
    );
    
    res.json({
      success: true,
      message: newStatus === 1 ? 'เปิดใช้งานอุปกรณ์สำเร็จ' : 'ปิดใช้งานอุปกรณ์สำเร็จ',
      data: { is_active: newStatus }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะอุปกรณ์',
      error: error.message
    });
  }
};

// ลบอุปกรณ์ (เก็บไว้กรณีต้องการลบจริงๆ - ใช้เฉพาะ admin)
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // ดึงรูปภาพที่เกี่ยวข้องก่อนลบ
    const images = await query(
      'SELECT image_url FROM equipment_images WHERE equipment_id = ?',
      [id]
    );

    // ลบไฟล์รูปภาพจาก folder
    for (const img of images) {
      deleteImageFile(img.image_url);
    }

    // ลบอุปกรณ์ (รูปภาพจะถูกลบอัตโนมัติจาก CASCADE)
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