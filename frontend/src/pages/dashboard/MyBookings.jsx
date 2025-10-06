import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, message, Space } from 'antd';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedBooking(record);
    setDetailModalVisible(true);
  };

  const handleCancelBooking = async () => {
    try {
      await api.put(`/bookings/${selectedBooking.booking_id}/cancel`, {
        cancellation_reason: 'ยกเลิกโดยผู้ใช้',
      });
      message.success('ยกเลิกการจองสำเร็จ');
      setCancelModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error('ไม่สามารถยกเลิกการจองได้');
    }
  };

  const columns = [
    {
      title: 'รหัส',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 80,
    },
    {
      title: 'สนาม',
      dataIndex: 'venue_name',
      key: 'venue_name',
    },
    {
      title: 'คอร์ท',
      dataIndex: 'court_name',
      key: 'court_name',
    },
    {
      title: 'วันที่',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (date) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'เวลา',
      key: 'time',
      render: (_, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: 'ราคา',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `฿${parseFloat(price).toLocaleString()}`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          pending: { color: 'orange', text: 'รอชำระเงิน' },
          confirmed: { color: 'blue', text: 'ยืนยันแล้ว' },
          paid: { color: 'green', text: 'ชำระแล้ว' },
          cancelled: { color: 'red', text: 'ยกเลิก' },
        };
        const { color, text } = config[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            ดูรายละเอียด
          </Button>
          {record.status !== 'cancelled' && record.status !== 'paid' && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setCancelModalVisible(true);
              }}
            >
              ยกเลิก
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">การจองของฉัน</h1>
      
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="booking_id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />

      {/* Detail Modal */}
      <Modal
        title="รายละเอียดการจอง"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">รหัสการจอง</p>
                <p className="font-semibold">#{selectedBooking.booking_id}</p>
              </div>
              <div>
                <p className="text-gray-600">สถานะ</p>
                <Tag color="blue">{selectedBooking.status}</Tag>
              </div>
              <div>
                <p className="text-gray-600">สนาม</p>
                <p className="font-semibold">{selectedBooking.venue_name}</p>
              </div>
              <div>
                <p className="text-gray-600">คอร์ท</p>
                <p className="font-semibold">{selectedBooking.court_name}</p>
              </div>
              <div>
                <p className="text-gray-600">วันที่</p>
                <p className="font-semibold">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">เวลา</p>
                <p className="font-semibold">
                  {selectedBooking.start_time} - {selectedBooking.end_time}
                </p>
              </div>
              <div>
                <p className="text-gray-600">ราคารวม</p>
                <p className="font-semibold text-lg text-blue-600">
                  ฿{parseFloat(selectedBooking.total_price).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="ยืนยันการยกเลิก"
        open={cancelModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setCancelModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?</p>
      </Modal>
    </div>
  );
};

export default MyBookings;