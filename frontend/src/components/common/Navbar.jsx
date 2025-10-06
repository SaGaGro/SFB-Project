import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Dropdown, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  CalendarOutlined,
  SettingOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMemberMenuItems = () => [
    {
      key: 'venues',
      icon: <CalendarOutlined />,
      label: 'เลือกสนาม',
      onClick: () => navigate('/venues'),
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'การจองของฉัน',
      onClick: () => navigate('/my-bookings'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getAdminMenuItems = () => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'จัดการระบบ',
      onClick: () => navigate('/admin/venues'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const userMenuItems = user?.role === 'member' 
    ? getMemberMenuItems() 
    : getAdminMenuItems();

  // ซ่อนปุ่ม Login/Register เมื่ออยู่ในหน้า Login/Register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-2 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-3xl">🏟️</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white drop-shadow-md">
                SPORT BOOKING
              </span>
              <p className="text-xs text-green-100">ระบบจองคอร์ทกีฬาออนไลน์</p>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-green-100 transition-colors font-medium hidden sm:block"
            >
              หน้าแรก
            </Link>

            {/* แสดงลิงก์ดูสนามเสมอ */}
            <Link 
              to="/venues" 
              className="text-white hover:text-green-100 transition-colors font-medium hidden sm:block"
            >
              ดูสนาม
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'member' ? (
                  <Link 
                    to="/my-bookings" 
                    className="text-white hover:text-green-100 transition-colors font-medium hidden md:block"
                  >
                    การจองของฉัน
                  </Link>
                ) : (
                  <Link 
                    to="/admin/dashboard" 
                    className="text-white hover:text-green-100 transition-colors font-medium hidden md:block"
                  >
                    จัดการระบบ
                  </Link>
                )}
                
                <Dropdown 
                  menu={{ items: userMenuItems }} 
                  placement="bottomRight"
                >
                  <div className="flex items-center space-x-3 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all">
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={user?.profile_image ? `${import.meta.env.VITE_BASE_URL}${user.profile_image}` : null}
                      className="bg-green-500 border-2 border-white"
                    />
                    <div className="text-left hidden sm:block">
                      <div className="text-white text-sm font-semibold">{user?.username}</div>
                      <div className="text-green-100 text-xs">
                        {user?.role === 'member' ? 'สมาชิก' : 'ผู้จัดการ'}
                      </div>
                    </div>
                  </div>
                </Dropdown>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button 
                      className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold h-10 px-6 rounded-full"
                      ghost
                    >
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      className="bg-white text-green-600 hover:bg-green-50 border-0 font-semibold h-10 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      สมัครสมาชิก
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;