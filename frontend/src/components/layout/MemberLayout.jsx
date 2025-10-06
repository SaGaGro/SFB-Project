import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { Layout } from 'antd';

const { Content, Footer } = Layout;

const MemberLayout = () => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      
      <Content className="container mx-auto px-4 py-8">
        <Outlet />
      </Content>

      <Footer className="bg-black text-gray-400 text-center">
        <div className="container mx-auto px-4">
          <p>Sport Booking System © 2025 - ระบบจองคอร์ทกีฬาออนไลน์</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default MemberLayout;