import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import Navbar from '../../components/common/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading, error, clearError } = useAuthStore();

  // ดึง redirect path จาก state (ถ้ามี)
  const from = location.state?.from || null;

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User authenticated:', user);
      console.log('🔄 Redirecting based on role:', user.role);
      
      // ถ้ามี from ให้ไปหน้าที่ต้องการ
      if (from) {
        console.log('🎯 Redirecting to from:', from);
        navigate(from, { replace: true });
      } else {
        // ถ้าไม่มี ให้ไปตาม role
        if (user.role === 'member') {
          console.log('🎯 Redirecting to member venues');
          navigate('/member/venues', { replace: true });
        } else if (user.role === 'admin' || user.role === 'manager') {
          console.log('🎯 Redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onFinish = async (values) => {
    try {
      const response = await login(values.email, values.password);
      console.log('✅ Login response:', response);
      message.success('เข้าสู่ระบบสำเร็จ');
      
      // Force redirect หลัง login สำเร็จ
      const userData = response.data.user;
      if (userData.role === 'member') {
        navigate('/member/venues', { replace: true });
      } else if (userData.role === 'admin' || userData.role === 'manager') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      message.error(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            <div className="text-center mb-8 bg-gradient-to-r from-green-600 to-emerald-600 -mx-6 -mt-6 px-6 py-8 text-white">
              <div className="text-5xl mb-3">🏟️</div>
              <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบ</h1>
              <p className="text-green-100">ยินดีต้อนรับกลับมา</p>
            </div>

            {from && (
              <Alert
                message="กรุณาเข้าสู่ระบบ"
                description="คุณต้องเข้าสู่ระบบก่อนเพื่อทำการจองสนาม"
                type="info"
                showIcon
                className="mb-4 rounded-lg"
              />
            )}

            {error && (
              <Alert
                message={error}
                type="error"
                closable
                onClose={clearError}
                className="mb-4 rounded-lg"
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label={<span className="font-semibold">อีเมล</span>}
                name="email"
                rules={[
                  { required: true, message: 'กรุณากรอกอีเมล' },
                  { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="text-green-600" />} 
                  placeholder="your@email.com"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">รหัสผ่าน</span>}
                name="password"
                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-green-600" />}
                  placeholder="รหัสผ่าน"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Link to="/forgot-password" className="text-green-600 hover:text-green-700 text-sm">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>

              <div className="text-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">ยังไม่มีบัญชี? </span>
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                  ลงทะเบียน
                </Link>
              </div>
            </Form>
          </Card>

          {/* <div className="mt-6 text-center">
            <p className="text-gray-600 mb-3">หรือเข้าชมเว็บไซต์ได้เลย</p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button className="rounded-full">
                  🏠 หน้าแรก
                </Button>
              </Link>
              <Link to="/venues">
                <Button className="rounded-full">
                  🏟️ ดูสนาม
                </Button>
              </Link>
            </div>
          </div> */}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Sport Booking System - ระบบจองคอร์ทกีฬาออนไลน์</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;