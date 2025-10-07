import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';

import Home from './pages/public/Home';
import GuestVenueBrowser from './pages/public/GuestVenueBrowser';
import GuestVenueDetail from './pages/public/GuestVenueDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import VenueList from './pages/member/VenueList';
import VenueDetail from './pages/member/VenueDetail';
import BookingForm from './pages/member/BookingForm';
import MyBookings from './pages/member/MyBookings';
import Profile from './pages/member/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import ManageVenues from './pages/admin/ManageVenues';
import ManageCourts from './pages/admin/ManageCourts';
import ManageBookings from './pages/admin/ManageBookings';

import ProtectedRoute from './components/common/ProtectedRoute';
import MemberLayout from './components/layout/MemberLayout';
import AdminLayout from './components/layout/AdminLayout';

import useAuthStore from './stores/authStore';

function App() {
  return (
    <ConfigProvider locale={thTH}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/venues" element={<GuestVenueBrowser />} />
          <Route path="/guest/venues/:id" element={<GuestVenueDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Member Routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route path="venues" element={<VenueList />} />
            <Route path="venues/:id" element={<VenueDetail />} />
            <Route path="booking/:venueId/:courtId" element={<BookingForm />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin/Manager Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="venues" element={<ManageVenues />} />
            <Route path="courts" element={<ManageCourts />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="users" element={<div>Manage Users (Coming Soon)</div>} />
          </Route>

          {/* Redirect based on role */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Redirect old routes */}
          <Route path="/my-bookings" element={<Navigate to="/member/my-bookings" replace />} />
          <Route path="/profile" element={<Navigate to="/member/profile" replace />} />
          <Route path="/booking/:venueId/:courtId" element={<Navigate to="/member/booking/:venueId/:courtId" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function RoleBasedRedirect() {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'member') {
    return <Navigate to="/member/venues" replace />;
  }
  
  return <Navigate to="/admin/dashboard" replace />;
}

// Component สำหรับ redirect หน้า Home
function HomeRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  
  // ถ้าล็อกอินแล้ว redirect ตาม role
  if (isAuthenticated && user) {
    if (user.role === 'member') {
      return <Navigate to="/member/venues" replace />;
    } else if (user.role === 'admin' || user.role === 'manager') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  // ถ้ายังไม่ล็อกอิน แสดงหน้า Home ปกติ
  return <Home />;
}

export default App;