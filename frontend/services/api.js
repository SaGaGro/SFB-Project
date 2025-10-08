import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // ✅ ตรวจสอบว่ามี error response หรือไม่
    if (error.response) {
      // Server ตอบกลับมาด้วย error
      console.log('❌ API Error Response:', error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // ไม่ redirect ที่นี่ เพราะจะทำใน component
      }
      
      // ✅ Reject ด้วย error object ที่มี message
      return Promise.reject(error.response.data || { message: 'เกิดข้อผิดพลาด' });
    } else if (error.request) {
      // Request ถูกส่งแต่ไม่มี response
      console.log('❌ No Response:', error.request);
      return Promise.reject({ message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
    } else {
      // Error อื่นๆ
      console.log('❌ Error:', error.message);
      return Promise.reject({ message: error.message || 'เกิดข้อผิดพลาด' });
    }
  }
);

export default api;