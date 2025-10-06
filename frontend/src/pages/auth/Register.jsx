import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import Navbar from '../../components/common/Navbar';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/venues');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onFinish = async (values) => {
    try {
      await register(values);
      message.success('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err) {
      message.error(err.message || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8 bg-gradient-to-r from-green-600 to-emerald-600 -mx-6 -mt-6 px-6 py-8 text-white">
              <div className="text-5xl mb-3">✨</div>
              <h1 className="text-3xl font-bold mb-2">ลงทะเบียน</h1>
              <p className="text-green-100">สร้างบัญชีใหม่เพื่อเริ่มจองคอร์ท</p>
            </div>

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
              name="register"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label={<span className="font-semibold">ชื่อผู้ใช้</span>}
                name="username"
                rules={[
                  { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                  { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="text-green-600" />} 
                  placeholder="ชื่อผู้ใช้" 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">อีเมล</span>}
                name="email"
                rules={[
                  { required: true, message: 'กรุณากรอกอีเมล' },
                  { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-green-600" />} 
                  placeholder="your@email.com" 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">เบอร์โทร</span>}
                name="phone"
                rules={[
                  { required: true, message: 'กรุณากรอกเบอร์โทร' },
                  { pattern: /^[0-9]{10}$/, message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined className="text-green-600" />} 
                  placeholder="0812345678" 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">รหัสผ่าน</span>}
                name="password"
                rules={[
                  { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                  { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-green-600" />} 
                  placeholder="รหัสผ่าน" 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">ยืนยันรหัสผ่าน</span>}
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-green-600" />} 
                  placeholder="ยืนยันรหัสผ่าน" 
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  ลงทะเบียน
                </Button>
              </Form.Item>

              <div className="text-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">มีบัญชีแล้ว? </span>
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </Form>
          </Card>

          {/* Quick Links */}
          <div className="mt-6 text-center">
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Sport Booking System - ระบบจองคอร์ทกีฬาออนไลน์</p>
        </div>
      </footer>
    </div>
  );
};

export default Register;