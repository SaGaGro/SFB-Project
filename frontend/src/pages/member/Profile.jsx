import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import api from '../../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_image);
  const [newImageUrl, setNewImageUrl] = useState(null); // เก็บ URL รูปใหม่ที่ยังไม่ได้บันทึก
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // แจ้งเตือนว่ามีการเปลี่ยนแปลง

  useEffect(() => {
    form.setFieldsValue({
      username: user?.username,
      email: user?.email,
      phone: user?.phone,
    });
  }, [user, form]);

  // ตรวจจับการเปลี่ยนแปลงใน Form
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  // อัปโหลดรูป - แค่เก็บ URL ไว้ก่อน ยังไม่บันทึกลง DB
  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      console.log('✅ Upload response:', info.file.response);
      
      if (info.file.response.success) {
        const imageUrl = info.file.response.data.imageUrl;
        setNewImageUrl(imageUrl); // เก็บ URL ไว้ก่อน ยังไม่บันทึก
        setAvatarUrl(imageUrl); // แสดงรูปใหม่ให้เห็น (preview)
        setHasUnsavedChanges(true); // มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
        message.info('เลือกรูปสำเร็จ กรุณากดบันทึกการเปลี่ยนแปลงเพื่อยืนยัน');
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

  // บันทึกทุกอย่างพร้อมกัน (ชื่อ, เบอร์, รูป)
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Updating profile with:', values);
      console.log('🖼️ New image URL:', newImageUrl);
      
      // ส่งข้อมูลทั้งหมด รวมถึงรูปใหม่ (ถ้ามี)
      const response = await api.put('/users/me', {
        username: values.username,
        phone: values.phone,
        profile_image: newImageUrl || avatarUrl // ใช้รูปใหม่ ถ้าไม่มีใช้รูปเดิม
      });

      console.log('✅ Update response:', response);

      if (response.success) {
        // อัปเดท user ใน store และ localStorage
        updateUser(response.data);
        setNewImageUrl(null); // เคลียร์รูปใหม่
        setHasUnsavedChanges(false); // เคลียร์สถานะการเปลี่ยนแปลง
        setAvatarUrl(response.data.profile_image); // อัปเดตรูปจาก response
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

  // ยกเลิกการเปลี่ยนแปลง
  const handleCancel = () => {
    form.setFieldsValue({
      username: user?.username,
      phone: user?.phone,
    });
    setAvatarUrl(user?.profile_image); // คืนค่ารูปเดิม
    setNewImageUrl(null); // เคลียร์รูปใหม่
    setHasUnsavedChanges(false);
    message.info('ยกเลิกการเปลี่ยนแปลง');
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

      {/* แจ้งเตือนเมื่อมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก */}
      {hasUnsavedChanges && (
        <Alert
          message="คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก"
          description="กรุณากดปุ่ม 'บันทึกการเปลี่ยนแปลง' เพื่อยืนยันการแก้ไข หรือกด 'ยกเลิก' เพื่อคืนค่าเดิม"
          type="warning"
          showIcon
          closable
          onClose={() => setHasUnsavedChanges(false)}
          className="rounded-xl"
        />
      )}

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
                {newImageUrl && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                    ยังไม่บันทึก
                  </div>
                )}
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
                  {newImageUrl ? 'เลือกรูปอื่น' : 'เปลี่ยนรูปโปรไฟล์'}
                </Button>
              </Upload>
              {newImageUrl && (
                <p className="text-xs text-gray-500 mt-2">
                  * กดบันทึกเพื่อยืนยันการเปลี่ยนรูป
                </p>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="ข้อมูลส่วนตัว">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              onValuesChange={handleFormChange}
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
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<SaveOutlined />}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                  
                  {hasUnsavedChanges && (
                    <Button
                      size="large"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-12"
                    >
                      ยกเลิก
                    </Button>
                  )}
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;