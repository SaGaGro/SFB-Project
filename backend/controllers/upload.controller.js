import { query } from '../config/database.js';
import { deleteFile } from '../config/multer.js';
import { logActivity } from '../utils/logger.js';

// Upload รูปโปรไฟล์ - บันทึกลง DB ทันที
export const uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const userId = req.user.user_id;
    
    // บันทึกลง Database ทันที
    await query(
      'UPDATE users SET profile_image = ? WHERE user_id = ?',
      [imageUrl, userId]
    );
    
    // Log activity
    await logActivity(userId, 'UPLOAD_PROFILE_IMAGE', 'users', userId);
    
    res.json({
      success: true,
      message: 'อัปโหลดรูปโปรไฟล์สำเร็จ',
      data: {
        imageUrl: imageUrl,
        fullUrl: `${process.env.BASE_URL || 'http://localhost:3000'}${imageUrl}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
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
    
    const imageUrls = [];
    
    // บันทึกรูปทั้งหมด
    for (const file of req.files) {
      const imageUrl = `/uploads/venues/${file.filename}`;
      imageUrls.push(imageUrl);
    }
    
    // 🆕 ถ้ามี venueId ให้บันทึกลง database ด้วย
    const { venueId } = req.body;
    if (venueId) {
      // ตรวจสอบว่ามี venue จริง
      const venues = await query(
        'SELECT venue_id FROM venues WHERE venue_id = ?',
        [venueId]
      );
      
      if (venues.length > 0) {
        for (const imageUrl of imageUrls) {
          await query(
            'INSERT INTO venue_images (venue_id, image_url) VALUES (?, ?)',
            [venueId, imageUrl]
          );
        }
        
        // Log activity
        await logActivity(req.user.user_id, 'UPLOAD_VENUE_IMAGES', 'venues', venueId);
      }
    }
    
    res.json({
      success: true,
      message: `อัพโหลดรูปสนามสำเร็จ ${imageUrls.length} รูป`,
      data: {
        venueId: venueId || null,
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

// แก้ไขฟังก์ชัน uploadCourtImages (บรรทัดที่ 97-145)
export const uploadCourtImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์'
      });
    }
    
    const imageUrls = [];
    
    // บันทึกรูปทั้งหมด
    for (const file of req.files) {
      const imageUrl = `/uploads/courts/${file.filename}`;
      imageUrls.push(imageUrl);
    }
    
    // 🆕 ถ้ามี courtId ให้บันทึกลง database ด้วย
    const { courtId } = req.body;
    if (courtId) {
      // ตรวจสอบว่ามี court จริง
      const courts = await query(
        'SELECT court_id FROM courts WHERE court_id = ?',
        [courtId]
      );
      
      if (courts.length > 0) {
        for (const imageUrl of imageUrls) {
          await query(
            'INSERT INTO court_images (court_id, image_url) VALUES (?, ?)',
            [courtId, imageUrl]
          );
        }
        
        // Log activity
        await logActivity(req.user.user_id, 'UPLOAD_COURT_IMAGES', 'courts', courtId);
      }
    }
    
    res.json({
      success: true,
      message: `อัพโหลดรูปคอร์ทสำเร็จ ${imageUrls.length} รูป`,
      data: {
        courtId: courtId || null,
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