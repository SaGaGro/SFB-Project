import { query } from '../config/database.js';
import { deleteFile } from '../config/multer.js';
import { logActivity } from '../utils/logger.js';

// Upload รูปโปรไฟล์ - แค่อัปโหลดไฟล์ ยังไม่บันทึกลง DB
export const uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    // แค่ return URL กลับไป ไม่บันทึกลง DB
    res.json({
      success: true,
      message: 'อัพโหลดไฟล์สำเร็จ (กรุณากดบันทึกการเปลี่ยนแปลงเพื่อบันทึกลงระบบ)',
      data: {
        imageUrl: imageUrl,
        fullUrl: `${process.env.BASE_URL || 'http://localhost:3000'}${imageUrl}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
      error: error.message
    });
  }
};

// Upload รูปสนาม (หลายรูป)
export const uploadVenueImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const { venueId } = req.body;
    
    if (!venueId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ venue_id'
      });
    }
    
    // ตรวจสอบว่ามี venue จริง
    const venues = await query(
      'SELECT venue_id FROM venues WHERE venue_id = ?',
      [venueId]
    );
    
    if (venues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสนามที่ต้องการ'
      });
    }
    
    const imageUrls = [];
    
    // บันทึกรูปทั้งหมด
    for (const file of req.files) {
      const imageUrl = `/uploads/venues/${file.filename}`;
      
      await query(
        'INSERT INTO venue_images (venue_id, image_url) VALUES (?, ?)',
        [venueId, imageUrl]
      );
      
      imageUrls.push(imageUrl);
    }
    
    // Log activity
    await logActivity(req.user.user_id, 'UPLOAD_VENUE_IMAGES', 'venues', venueId);
    
    res.json({
      success: true,
      message: `อัพโหลดรูปสนามสำเร็จ ${imageUrls.length} รูป`,
      data: {
        venueId: venueId,
        images: imageUrls,
        count: imageUrls.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
      error: error.message
    });
  }
};

// Upload รูปคอร์ท (หลายรูป)
export const uploadCourtImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const { courtId } = req.body;
    
    if (!courtId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ court_id'
      });
    }
    
    // ตรวจสอบว่ามี court จริง
    const courts = await query(
      'SELECT court_id FROM courts WHERE court_id = ?',
      [courtId]
    );
    
    if (courts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคอร์ทที่ต้องการ'
      });
    }
    
    const imageUrls = [];
    
    // บันทึกรูปทั้งหมด
    for (const file of req.files) {
      const imageUrl = `/uploads/courts/${file.filename}`;
      
      await query(
        'INSERT INTO court_images (court_id, image_url) VALUES (?, ?)',
        [courtId, imageUrl]
      );
      
      imageUrls.push(imageUrl);
    }
    
    // Log activity
    await logActivity(req.user.user_id, 'UPLOAD_COURT_IMAGES', 'courts', courtId);
    
    res.json({
      success: true,
      message: `อัพโหลดรูปคอร์ทสำเร็จ ${imageUrls.length} รูป`,
      data: {
        courtId: courtId,
        images: imageUrls,
        count: imageUrls.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
      error: error.message
    });
  }
};

// Upload รูปอุปกรณ์ (หลายรูป)
export const uploadEquipmentImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const { equipmentId } = req.body;
    
    if (!equipmentId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ equipment_id'
      });
    }
    
    // ตรวจสอบว่ามี equipment จริง
    const equipment = await query(
      'SELECT equipment_id FROM equipment WHERE equipment_id = ?',
      [equipmentId]
    );
    
    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบอุปกรณ์ที่ต้องการ'
      });
    }
    
    const imageUrls = [];
    
    // บันทึกรูปทั้งหมด
    for (const file of req.files) {
      const imageUrl = `/uploads/equipment/${file.filename}`;
      
      await query(
        'INSERT INTO equipment_images (equipment_id, image_url) VALUES (?, ?)',
        [equipmentId, imageUrl]
      );
      
      imageUrls.push(imageUrl);
    }
    
    // Log activity
    await logActivity(req.user.user_id, 'UPLOAD_EQUIPMENT_IMAGES', 'equipment', equipmentId);
    
    res.json({
      success: true,
      message: `อัพโหลดรูปอุปกรณ์สำเร็จ ${imageUrls.length} รูป`,
      data: {
        equipmentId: equipmentId,
        images: imageUrls,
        count: imageUrls.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
      error: error.message
    });
  }
};

// ลบรูป
export const deleteImage = async (req, res) => {
  try {
    const { type, id } = req.params; // type: venue, court, equipment
    
    let tableName, columnName;
    
    switch(type) {
      case 'venue':
        tableName = 'venue_images';
        columnName = 'venue_id';
        break;
      case 'court':
        tableName = 'court_images';
        columnName = 'court_id';
        break;
      case 'equipment':
        tableName = 'equipment_images';
        columnName = 'equipment_id';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'ประเภทไม่ถูกต้อง'
        });
    }
    
    // ดึงข้อมูลรูป
    const images = await query(
      `SELECT image_url FROM ${tableName} WHERE image_id = ?`,
      [id]
    );
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบรูปภาพ'
      });
    }
    
    // ลบไฟล์
    const filePath = `.${images[0].image_url}`;
    deleteFile(filePath);
    
    // ลบจากฐานข้อมูล
    await query(`DELETE FROM ${tableName} WHERE image_id = ?`, [id]);
    
    // Log activity
    await logActivity(req.user.user_id, `DELETE_${type.toUpperCase()}_IMAGE`, tableName, id);
    
    res.json({
      success: true,
      message: 'ลบรูปภาพสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบไฟล์',
      error: error.message
    });
  }
};