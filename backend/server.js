import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, query } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sport Booking System API',
    version: '1.0.0'
  });
});


// Start server
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});