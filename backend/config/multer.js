import multer from 'multer';
import path from 'path';
import fs from 'fs';

// สร้างโฟลเดอร์ถ้ายังไม่มี
const createUploadDirs = () => {
  const dirs = [
    'uploads/profiles',
    'uploads/venues',
    'uploads/courts',
    'uploads/equipment',
    'uploads/qr'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// กำหนดที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // กำหนดโฟลเดอร์ตาม fieldname
    let uploadPath = 'uploads/';
    
    switch(file.fieldname) {
      case 'profile':
        uploadPath += 'profiles/';
        break;
      case 'venue':
      case 'venueImages':
        uploadPath += 'venues/';
        break;
      case 'court':
      case 'courtImages':
        uploadPath += 'courts/';
        break;
      case 'equipment':
      case 'equipmentImages':
        uploadPath += 'equipment/';
        break;
      default:
        uploadPath += 'others/';
    }
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์แบบ unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// กรองไฟล์ (รับเฉพาะรูปภาพ)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPEG, PNG, GIF, WebP)'), false);
  }
};

// สร้าง multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ 5MB
  }
});

// Middleware สำหรับ upload รูปเดียว
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware สำหรับ upload หลายรูป
export const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB ต่อไฟล์)'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `อัพโหลดได้สูงสุด ${maxCount} ไฟล์`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware สำหรับ upload หลาย field
export const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB ต่อไฟล์)'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// ฟังก์ชันลบไฟล์
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Delete File Error:', error);
    return false;
  }
};