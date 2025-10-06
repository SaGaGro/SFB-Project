import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message } from 'antd';
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
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">โปรไฟล์ของฉัน</h1>

      <Card>
        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={120}
            icon={<UserOutlined />}
            src={avatarUrl ? `${import.meta.env.VITE_BASE_URL}${avatarUrl}` : undefined}
            className="mb-4"
          />
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>เปลี่ยนรูปโปรไฟล์</Button>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
          >
            <Input prefix={<UserOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            label="อีเมล"
            name="email"
          >
            <Input prefix={<MailOutlined />} disabled size="large" />
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
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;