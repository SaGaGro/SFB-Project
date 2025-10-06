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
      console.error('🔐 Login failed:', error);
      set({ 
        error: error.message || 'เกิดข้อผิดพลาด', 
        loading: false 
      });
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

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;