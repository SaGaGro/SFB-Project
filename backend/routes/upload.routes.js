import express from 'express';
import {
  uploadProfile,
  uploadVenueImages,
  uploadCourtImages,
  uploadEquipmentImages,
  deleteImage
} from '../controllers/upload.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple } from '../config/multer.js';

const router = express.Router();

// Upload รูปโปรไฟล์ (ผู้ใช้ทั่วไป)
router.post(
  '/profile',
  authenticate,
  uploadSingle('profile'),
  uploadProfile
);

// Upload รูปสนาม (Admin/Manager only)
router.post(
  '/venue',
  authenticate,
  authorize('admin', 'manager'),
  uploadMultiple('venueImages', 10),
  uploadVenueImages
);

// Upload รูปคอร์ท (Admin/Manager only)
router.post(
  '/court',
  authenticate,
  authorize('admin', 'manager'),
  uploadMultiple('courtImages', 10),
  uploadCourtImages
);

// Upload รูปอุปกรณ์ (Admin/Manager only)
router.post(
  '/equipment',
  authenticate,
  authorize('admin', 'manager'),
  uploadMultiple('equipmentImages', 10),
  uploadEquipmentImages
);

// ลบรูป (Admin/Manager only)
router.delete(
  '/:type/:id',
  authenticate,
  authorize('admin', 'manager'),
  deleteImage
);

export default router;