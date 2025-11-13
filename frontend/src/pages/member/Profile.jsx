import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Modal, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, SaveOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_image);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // const [deletePassword, setDeletePassword] = useState(''); // ⭐️ ลบ state นี้
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      console.log('📝 Updating profile with:', values);
      
      // ส่งแค่ชื่อกับเบอร์ ไม่ต้องส่งรูป (บันทึกไปแล้วตอน upload)
      const response = await api.put('/users/me', {
        username: values.username,
        phone: values.phone
      });

      console.log('✅ Update response:', response);

      if (response.success) {
        // อัปเดต user ใน store และ localStorage
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

  // เปิด Modal ยืนยันการลบบัญชี
  const showDeleteConfirm = () => {
    setDeleteModalVisible(true);
    // setDeletePassword(''); // ⭐️ ลบบรรทัดนี้
  };

  // ลบบัญชี
  const handleDeleteAccount = async () => {
    // ⭐️ ลบการตรวจสอบ password
    // if (!deletePassword) {
    //   message.error('กรุณากรอกรหัสผ่านเพื่อยืนยัน');
    //   return;
    // }

    setDeleteLoading(true);
    try {
      // ⭐️ ส่ง request โดยไม่มี data (password)
      const response = await api.delete('/users/me');

      if (response.success) {
        message.success('ลบบัญชีสำเร็จ');
        setDeleteModalVisible(false);
        
        // Logout และ redirect ไปหน้า login
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(response.message || 'ลบบัญชีไม่สำเร็จ');
      }
    } catch (error) {
      console.error('❌ Delete account error:', error);
      message.error(error.message || 'ไม่สามารถลบบัญชีได้');
    } finally {
      setDeleteLoading(false);
    }
  };

const uploadProps = {
  name: 'profile',
  action: `${import.meta.env.VITE_API_URL}/upload/profile`,
  // ✅ ไม่ต้องส่ง Authorization header เพราะ cookie จะถูกส่งไปอัตโนมัติ
  // หรือถ้า backend ต้องการ token จาก localStorage ให้เช็คว่ามีจริง
  headers: localStorage.getItem('token') ? {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  } : {},
  withCredentials: true, // ✅ สำคัญมาก! ทำให้ส่ง cookie ไปด้วย
  onChange: handleAvatarUpload,
  showUploadList: false,
  accept: 'image/*',
};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 -mx-4 -mt-8 px-4 py-8 mb-8">
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

          {/* Card สำหรับลบบัญชี */}
          <Card className="mt-6 border-red-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                ลบบัญชี
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                การลบบัญชีจะทำให้คุณไม่สามารถเข้าสู่ระบบได้อีก
              </p>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={showDeleteConfirm}
                block
              >
                ลบบัญชีของฉัน
              </Button>
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
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 border-0 font-semibold h-12"
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Modal ยืนยันการลบบัญชี */}
      <Modal
        title={
          <span className="text-red-600 font-semibold">
            <ExclamationCircleOutlined className="mr-2" />
            ยืนยันการลบบัญชี
          </span>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setDeleteModalVisible(false)}
            disabled={deleteLoading}
          >
            ยกเลิก
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleteLoading}
            onClick={handleDeleteAccount}
            icon={<DeleteOutlined />}
          >
            ยืนยันการลบบัญชี
          </Button>
        ]}
      >
        <Alert
          message="คำเตือน!"
          description="การลบบัญชีจะทำให้คุณไม่สามารถเข้าสู่ระบบได้อีก และข้อมูลทั้งหมดจะถูกปิดการใช้งาน"
          type="warning"
          showIcon
          className="mb-4"
        />
        
        {/* ⭐️ ลบ Form และ Input.Password ออกจากตรงนี้ */}
        
        <p className="text-gray-600">
          คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ? 
          <br />
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>

      </Modal>
    </div>
  );
};

export default Profile;