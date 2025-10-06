import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
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

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await api.put(`/users/${user.user_id}`, values);
      updateUser({ ...user, ...values });
      message.success('อัพเดทโปรไฟล์สำเร็จ');
    } catch (error) {
      message.error('ไม่สามารถอัพเดทโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'done') {
      const imageUrl = info.file.response.data.imageUrl;
      setAvatarUrl(imageUrl);
      updateUser({ ...user, profile_image: imageUrl });
      message.success('อัพโหลดรูปโปรไฟล์สำเร็จ');
    } else if (info.file.status === 'error') {
      message.error('อัพโหลดรูปไม่สำเร็จ');
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-800 -mx-4 -mt-8 px-4 py-8 mb-8">
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
              <Avatar
                size={150}
                icon={<UserOutlined />}
                src={avatarUrl ? `${import.meta.env.VITE_BASE_URL}${avatarUrl}` : undefined}
                className="mb-4 border-4 border-gray-200"
              />
              <h3 className="text-xl font-bold mb-1">{user?.username}</h3>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} block>
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
                <Input prefix={<UserOutlined />} size="large" />
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
                  { pattern: /^[0-9]{10}$/, message: 'เบอร์โทรไม่ถูกต้อง' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="bg-red-600 hover:bg-red-700"
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