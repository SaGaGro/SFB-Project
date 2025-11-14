import { create } from 'zustand';
import authService from '../../services/auth.service';

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(email, password);
      console.log('🔐 Login successful:', response.data.user);
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        loading: false 
      });
      return response;
    } catch (error) {
      console.error('🔐 Login failed in store:', error);
      set({ 
        error: error.message || 'เกิดข้อผิดพลาด', 
        loading: false 
      });
      // ✅ Throw error ต่อให้ component จัดการ
      throw error;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(data);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ 
        error: error.message || 'เกิดข้อผิดพลาด', 
        loading: false 
      });
      throw error;
    }
  },

  // 🔽 === แก้ไขส่วนนี้ === 🔽
  logout: async () => {
    set({ loading: true }); // (Optional) แสดง loading
    try {
      await authService.logout(); // รอให้ service ทำงานเสร็จ
    } catch (error) {
      console.error('🔐 Logout failed in store:', error);
    } finally {
      // เคลียร์ state ใน store เสมอ
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
  // 🔼 === สิ้นสุดส่วนที่แก้ไข === 🔼

  updateUser: (userData) => {
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;