// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';
import { testConnection } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { cancelExpiredPayments } from './controllers/payment.controller.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import venueRoutes from './routes/venue.routes.js';
import courtRoutes from './routes/court.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import equipmentRoutes from './routes/equipment.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import omiseRoutes from './routes/omise.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// ==========================
// ✅ CORS Configuration
// ==========================

// 1. อ่านค่า ALLOWED_ORIGINS จากไฟล์ .env
const originsFromEnv = process.env.ALLOWED_ORIGINS || '';

// 2. แปลง String (ที่คั่นด้วยจุลภาค) ให้เป็น Array
// .filter(Boolean) คือการกรองค่าว่างออก (เช่น ถ้า .env เป็นค่าว่าง)
const allowedOrigins = originsFromEnv.split(',').filter(Boolean);

// 3. (Optional) แสดง Log ให้เห็นว่าดึงค่ามาสำเร็จ
if (allowedOrigins.length > 0) {
  console.log('✅ CORS Allowed Origins:', allowedOrigins);
} else {
  console.warn('⚠️ CORS: ALLOWED_ORIGINS is not set in .env. All cross-origin requests may be blocked.');
}

const corsOptions = {
  origin: function (origin, callback) {
    // อนุญาต requests ที่ไม่มี origin (Postman, mobile apps, webhook)
    if (!origin) return callback(null, true);

    // 4. ตรวจสอบว่า origin ที่ยิงมา อยู่ใน list ที่เราอนุญาตหรือไม่
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

// apply CORS globally
app.use(cors(corsOptions));

// ==========================
// ✅ Middleware
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ==========================
// 📚 Swagger Documentation
// ==========================
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sport Booking API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true
    }
  })
);

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ==========================
// ✅ Health & API Info
// ==========================
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Sport Booking System API',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      json: '/api-docs.json'
    },
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      venues: '/api/venues',
      courts: '/api/courts',
      bookings: '/api/bookings',
      equipment: '/api/equipment',
      payments: '/api/payments',
      notifications: '/api/notifications',
      upload: '/api/upload',
      omise: '/api/omise',
      webhooks: '/api/webhooks/omise'
    }
  });
});

// ==========================
// ✅ Routes
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/omise', omiseRoutes);


// ==========================
// ✅ Error Handling
// ==========================
app.use(notFound);
app.use(errorHandler);

// ==========================
// ✅ Cron job สำหรับยกเลิก expired payment
// ==========================
setInterval(async () => {
  try {
    const cancelledCount = await cancelExpiredPayments();
    if (cancelledCount > 0) {
      console.log(`⏰ Cancelled ${cancelledCount} expired payments`);
    }
  } catch (error) {
    console.error('Error in payment expiry cron:', error);
  }
}, 30 * 1000); // ทุก 30 วินาที

// ==========================
// ✅ Database & Start Server
// ==========================
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
    console.log(`🔔 Webhook URL: ${process.env.OMISE_WEBHOOK_URL}`);
  });
});