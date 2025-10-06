import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, message, Space, Card } from 'antd';
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

  const statusConfig = {
    pending: { color: 'orange', text: 'รอชำระเงิน' },
    confirmed: { color: 'blue', text: 'ยืนยันแล้ว' },
    paid: { color: 'green', text: 'ชำระแล้ว' },
    cancelled: { color: 'red', text: 'ยกเลิก' },
  };

  const columns = [
    {
      title: 'รหัสการจอง',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 100,
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
      render: (price) => (
        <span className="font-semibold text-red-600">
          {parseFloat(price).toLocaleString()} บาท
        </span>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = statusConfig[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setDetailModalVisible(true);
            }}
          >
            ดู
          </Button>
          {record.status !== 'cancelled' && record.status !== 'paid' && (
            <Button
              size="small"
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-800 -mx-4 -mt-8 px-4 py-8 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">การจองของฉัน</h1>
          <p className="text-white opacity-90 mt-2">
            ดูและจัดการการจองคอร์ทกีฬาของคุณ
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="booking_id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`
          }}
        />
      </Card>

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
                <p className="text-gray-600 text-sm">รหัสการจอง</p>
                <p className="font-semibold text-lg">#{selectedBooking.booking_id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">สถานะ</p>
                <Tag color={statusConfig[selectedBooking.status]?.color}>
                  {statusConfig[selectedBooking.status]?.text}
                </Tag>
              </div>
              <div>
                <p className="text-gray-600 text-sm">สนาม</p>
                <p className="font-semibold">{selectedBooking.venue_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">คอร์ท</p>
                <p className="font-semibold">{selectedBooking.court_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">วันที่</p>
                <p className="font-semibold">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">เวลา</p>
                <p className="font-semibold">
                  {selectedBooking.start_time} - {selectedBooking.end_time} น.
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm">ราคารวม</p>
                <p className="font-bold text-2xl text-red-600">
                  {parseFloat(selectedBooking.total_price).toLocaleString()} บาท
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="ยืนยันการยกเลิก"
        open={cancelModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้</p>
        <p className="text-gray-600 text-sm mt-2">
          การยกเลิกจะไม่สามารถกู้คืนได้
        </p>
      </Modal>
    </div>
  );
};

export default MyBookings;