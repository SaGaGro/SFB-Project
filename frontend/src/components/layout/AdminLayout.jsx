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
  SettingOutlined,
  ShoppingOutlined
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
      key: '/admin/equipment',
      icon: <ShoppingOutlined />,
      label: 'จัดการอุปกรณ์',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'จัดการผู้ใช้',
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'ตั้งค่า',
    //   onClick: () => navigate('/profile'),
    // },
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
  <Layout style={{ minHeight: '100vh' }}>
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      breakpoint="lg"
      onBreakpoint={(broken) => setCollapsed(broken)}
      className="shadow-lg flex flex-col justify-between"
      style={{ 
        background: '#001529',
        minHeight: '100vh'
      }}
    >
      {/* ส่วนบนของ Sidebar */}
      <div>
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!collapsed ? (
            <div className="text-white font-bold text-lg">Admin Panel</div>
          ) : (
            <div className="text-white font-bold text-xl">AP</div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.filter(item => item.key !== 'logout')}
          onClick={handleMenuClick}
        />
      </div>

      {/* ปุ่มออกจากระบบอยู่ล่างสุด */}
      <div className="border-t border-gray-700">
        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'ออกจากระบบ',
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
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
        
        <div className="flex items-center space-x-4 text-white">
          {/* <Link to="/" className="hover:text-red-600">
            กลับสู่หน้าแรก
          </Link> */}
          <div className="flex items-center space-x-2">
            <UserOutlined />
            <div className="text-left">
              <div className="text-sm font-semibold">{user?.username}</div>
              <div className="text-xs">
                {user?.role === 'admin' ? 'เจ้าของ' : 'ผู้จัดการ'}
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