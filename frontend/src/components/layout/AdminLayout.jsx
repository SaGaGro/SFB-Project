import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  EnvironmentOutlined,
  CalendarOutlined, 
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/venues',
      icon: <EnvironmentOutlined />,
      label: 'จัดการสนาม',
    },
    {
      key: '/admin/bookings',
      icon: <CalendarOutlined />,
      label: 'จัดการการจอง',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'จัดการผู้ใช้',
      style: user?.role !== 'admin' ? { display: 'none' } : {},
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'ตั้งค่า',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key !== 'logout' && key !== 'settings') {
      navigate(key);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        className="shadow-lg"
        style={{ background: '#001529' }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!collapsed ? (
            <div className="text-white font-bold text-lg">
              Admin Panel
            </div>
          ) : (
            <div className="text-white font-bold text-xl">AP</div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer hover:text-red-600"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer hover:text-red-600"
                onClick={() => setCollapsed(true)}
              />
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-red-600">
              กลับสู่หน้าแรก
            </Link>
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-semibold">{user?.username}</div>
                <div className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้จัดการ'}
                </div>
              </div>
            </div>
          </div>
        </Header>
        
        <Content className="m-6">
          <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;