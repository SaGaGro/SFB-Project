import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import omiseRoutes from './routes/omise.routes.js'; // เพิ่ม

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sport Booking System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      venues: '/api/venues',
      courts: '/api/courts',
      bookings: '/api/bookings',
      equipment: '/api/equipment',
      payments: '/api/payments',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      omise: '/api/omise', // เพิ่ม
      webhooks: '/api/webhooks', // เพิ่ม
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/omise', omiseRoutes); // เพิ่ม
app.use('/api/webhooks/omise', omiseRoutes); // เพิ่ม (สำหรับ webhook)

app.use(notFound);
app.use(errorHandler);

setInterval(async () => {
  try {
    const cancelledCount = await cancelExpiredPayments();
    if (cancelledCount > 0) {
      console.log(`⏰ Cancelled ${cancelledCount} expired payments`);
    }
  } catch (error) {
    console.error('Error in payment expiry cron:', error);
  }
}, 30 * 1000);

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🔔 Webhook URL: ${process.env.OMISE_WEBHOOK_URL}`);
  });
});