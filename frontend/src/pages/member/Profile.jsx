import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import api from '../../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_image);

  useEffect(() => {
    form.setFieldsValue({
      username: user?.username,
      email: user?.email,
      phone: user?.phone,
    });
  }, [user, form]);

  // อัปโหลดรูป - บันทึกทันที
  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      console.log('✅ Upload response:', info.file.response);
      
      if (info.file.response.success) {
        const imageUrl = info.file.response.data.imageUrl;
        
        // บันทึกรูปเลย ไม่ต้องรอกดปุ่ม
        setAvatarUrl(imageUrl);
        
        // อัปเดต user ใน store และ localStorage ทันที
        const updatedUser = { ...user, profile_image: imageUrl };
        updateUser(updatedUser);
        
        message.success('เปลี่ยนรูปโปรไฟล์สำเร็จ');
      } else {
        message.error('อัปโหลดไม่สำเร็จ');
      }
      setLoading(false);
    } else if (info.file.status === 'error') {
      console.error('❌ Upload error:', info.file.error);
      message.error('อัปโหลดรูปไม่สำเร็จ');
      setLoading(false);
    }
  };

  // บันทึกข้อมูล profile (ชื่อ, เบอร์)
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Updating profile with:', values);
      
      // ส่งแค่ชื่อกับเบอร์ ไม่ต้องส่งรูป (บันทึกไปแล้วตอน upload)
      const response = await api.put('/users/me', {
        username: values.username,
        phone: values.phone
      });

      console.log('✅ Update response:', response);

      if (response.success) {
        // อัปเดท user ใน store และ localStorage
        updateUser(response.data);
        message.success('อัปเดตโปรไฟล์สำเร็จ');
      } else {
        throw new Error(response.message || 'อัปเดตไม่สำเร็จ');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      message.error(error.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'profile',
    action: `${import.meta.env.VITE_API_URL}/upload/profile`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange: handleAvatarUpload,
    showUploadList: false,
    accept: 'image/*',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 -mx-4 -mt-8 px-4 py-8 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">โปรไฟล์ของฉัน</h1>
          <p className="text-white opacity-90 mt-2">
            จัดการข้อมูลส่วนตัวของคุณ
          </p>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar
                  size={150}
                  icon={<UserOutlined />}
                  src={avatarUrl ? `${import.meta.env.VITE_BASE_URL}${avatarUrl}` : undefined}
                  className="mb-4 border-4 border-gray-200"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">{user?.username}</h3>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <Upload {...uploadProps}>
                <Button 
                  icon={<UploadOutlined />} 
                  block
                  loading={loading}
                  disabled={loading}
                >
                  เปลี่ยนรูปโปรไฟล์
                </Button>
              </Upload>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="ข้อมูลส่วนตัว">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[
                  { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                  { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  size="large"
                  placeholder="ชื่อผู้ใช้"
                />
              </Form.Item>

              <Form.Item label="อีเมล" name="email">
                <Input 
                  prefix={<MailOutlined />} 
                  disabled 
                  size="large"
                  className="bg-gray-100"
                />
              </Form.Item>

              <Form.Item
                label="เบอร์โทร"
                name="phone"
                rules={[
                  { required: true, message: 'กรุณากรอกเบอร์โทร' },
                  { pattern: /^[0-9]{10}$/, message: 'เบอร์โทรไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  size="large"
                  placeholder="0812345678"
                  maxLength={10}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<SaveOutlined />}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12"
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;