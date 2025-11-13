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

  logout: () => {
    // localStorage.removeItem('token'); // ❗️ 2. ลบบรรทัดนี้
    localStorage.removeItem('user');
    // (แนะนำ: ควรเรียก API /auth/logout ที่ backend เพื่อ clear cookie ด้วย)
  },

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