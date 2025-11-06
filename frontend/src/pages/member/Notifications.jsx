import { useEffect, useState } from 'react';
import { List, Badge, Button, Empty, message, Card, Tag } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';

dayjs.extend(relativeTime);
dayjs.locale('th');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      message.error('ไม่สามารถโหลดการแจ้งเตือนได้');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      message.error('ไม่สามารถทำรายการได้');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      message.success('อ่านทั้งหมดแล้ว');
      fetchNotifications();
    } catch (error) {
      message.error('ไม่สามารถทำรายการได้');
    }
  };

  const handleDeleteClick = (notificationId) => {
    setSelectedNotificationId(notificationId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('🗑️ Deleting notification:', selectedNotificationId);
      const response = await api.delete(`/notifications/${selectedNotificationId}`);
      console.log('✅ Delete response:', response);
      message.success(response.message || 'ซ่อนการแจ้งเตือนสำเร็จ');
      setDeleteModalOpen(false);
      setSelectedNotificationId(null);
      fetchNotifications();
    } catch (error) {
      console.error('❌ Delete error:', error);
      message.error(error.message || 'ไม่สามารถทำรายการได้');
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedNotificationId(null);
  };

  const handleNotificationClick = async (notification) => {
    // อ่านการแจ้งเตือน
    if (!notification.is_read) {
      await handleMarkAsRead(notification.notification_id);
    }

    // ไปที่หน้าที่เกี่ยวข้องถ้าเป็นเรื่องการจองหรือการชำระเงิน
    if (notification.type === 'booking' || notification.type === 'payment') {
      navigate('/member/my-bookings');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <InfoCircleOutlined className="text-blue-600" />;
      case 'payment':
        return <CheckOutlined className="text-green-600" />;
      case 'event':
        return <BellOutlined className="text-orange-600" />;
      case 'system':
        return <InfoCircleOutlined className="text-gray-600" />;
      default:
        return <BellOutlined className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'blue';
      case 'payment':
        return 'green';
      case 'event':
        return 'orange';
      case 'system':
        return 'default';
      default:
        return 'default';
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case 'booking':
        return 'การจอง';
      case 'payment':
        return 'การชำระเงิน';
      case 'event':
        return 'กิจกรรม';
      case 'system':
        return 'ระบบ';
      default:
        return 'ทั่วไป';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 -mx-4 -mt-8 px-4 py-8 mb-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">การแจ้งเตือน</h1>
              <p className="text-white opacity-90 mt-2">
                ดูการแจ้งเตือนและอัพเดทต่างๆ
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge count={unreadCount} className="text-2xl">
                <BellOutlined className="text-4xl text-white" />
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            การแจ้งเตือนทั้งหมด ({notifications.length})
          </h2>
          {unreadCount > 0 && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Empty
            description="ไม่มีการแจ้งเตือน"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  !item.is_read ? 'bg-blue-50' : ''
                }`}
                actions={[
                  !item.is_read && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.notification_id);
                      }}
                    >
                      อ่านแล้ว
                    </Button>
                  ),
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item.notification_id);
                    }}
                  >
                    ลบ
                  </Button>,
                ].filter(Boolean)}
                onClick={() => handleNotificationClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      {getNotificationIcon(item.type)}
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className={!item.is_read ? 'font-bold' : ''}>
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <Badge status="processing" />
                      )}
                      <Tag color={getNotificationColor(item.type)} className="ml-2">
                        {getNotificationLabel(item.type)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p className={!item.is_read ? 'font-medium' : 'text-gray-600'}>
                        {item.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dayjs(item.created_at).fromNow()}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <DeleteOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ยืนยันการลบ</h3>
                  <p className="text-gray-500 text-sm mt-1">โปรดตรวจสอบก่อนดำเนินการ</p>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mb-6">
                <p className="text-gray-800 text-base">
                  คุณแน่ใจหรือไม่ที่จะลบการแจ้งเตือนนี้? การแจ้งเตือนจะถูกซ่อนออกจากรายการของคุณ
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  size="large"
                  onClick={handleDeleteCancel}
                  className="px-8 h-11 font-semibold"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  danger
                  size="large"
                  onClick={handleDeleteConfirm}
                  className="px-8 h-11 font-semibold"
                  icon={<DeleteOutlined />}
                >
                  ยืนยันการลบ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
