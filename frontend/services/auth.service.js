import api from './api';

const authService = {
  register: async (data) => {
    return await api.post('/auth/register', data);
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // ❗️ response.data.token จะไม่มีแล้ว
      if (response.success && response.data.user) {
        // localStorage.setItem('token', response.data.token); // ❗️ 1. ลบบรรทัดนี้
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      // ✅ Throw error ต่อไป
      console.error('❌ Auth Service Login Error:', error);
      throw error;
    }
  },

  // 🔽 === แก้ไขส่วนนี้ === 🔽
  logout: async () => {
    try {
      // 1. เรียก API logout เพื่อให้ backend เคลียร์ cookie
      await api.post('/auth/logout');
    } catch (error) {
      // ไม่เป็นไรหาก error (เช่น token หมดอายุ) แค่ log ไว้
      console.error('❌ Logout API call failed:', error);
    } finally {
      // 2. เคลียร์ localStorage ฝั่ง client เสมอ
      localStorage.removeItem('user');
    }
  },
  // 🔼 === สิ้นสุดส่วนที่แก้ไข === 🔼

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    // ❗️ 3. เปลี่ยนเป็นเช็ค 'user' แทน 'token'
    return !!localStorage.getItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },
};

export default authService;