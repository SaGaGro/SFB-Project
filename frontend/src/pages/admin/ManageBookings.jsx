import { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Select,
  message,
  Card,
  Input,
  DatePicker
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchText, dateRange]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data || []);
      setFilteredBookings(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(b =>
        b.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        b.venue_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        b.booking_id?.toString().includes(searchText)
      );
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(b => {
        const bookingDate = dayjs(b.booking_date);
        return bookingDate.isAfter(dateRange[0].startOf('day')) && 
               bookingDate.isBefore(dateRange[1].endOf('day'));
      });
    }

    setFilteredBookings(filtered);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      message.success('อัพเดทสถานะสำเร็จ');
      fetchBookings();
    } catch (error) {
      message.error('ไม่สามารถอัพเดทสถานะได้');
    }
  };

  const confirmPayment = (bookingId) => {
    Modal.confirm({
      title: 'ยืนยันการชำระเงิน',
      content: 'คุณแน่ใจหรือไม่ที่จะยืนยันการชำระเงิน',
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      onOk: () => handleUpdateStatus(bookingId, 'paid'),
    });
  };

  const statusConfig = {
    pending: { color: 'orange', text: 'รอชำระเงิน' },
    confirmed: { color: 'blue', text: 'ยืนยันแล้ว' },
    paid: { color: 'green', text: 'ชำระแล้ว' },
    cancelled: { color: 'red', text: 'ยกเลิก' },
  };

  const columns = [
    {
      title: 'รหัส',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 80,
    },
    {
      title: 'ผู้จอง',
      dataIndex: 'username',
      key: 'username',
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
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
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
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => confirmPayment(record.booking_id)}
              className="bg-green-600 hover:bg-green-700"
            >
              ยืนยัน
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    paid: bookings.filter(b => b.status === 'paid').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">จัดการการจอง</h2>
        <p className="text-gray-600">ดูและจัดการการจองทั้งหมด</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">ทั้งหมด</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">รอชำระเงิน</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">ชำระแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">ยกเลิก</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="ค้นหาชื่อผู้จอง, สนาม, รหัสการจอง..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="all">สถานะทั้งหมด</Option>
              <Option value="pending">รอชำระเงิน</Option>
              <Option value="confirmed">ยืนยันแล้ว</Option>
              <Option value="paid">ชำระแล้ว</Option>
              <Option value="cancelled">ยกเลิก</Option>
            </Select>

            <RangePicker
              format="DD/MM/YYYY"
              onChange={setDateRange}
              className="w-full"
              placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="booking_id"
          loading={loading}
          scroll={{ x: 1200 }}
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
                <p className="text-gray-600 text-sm">ผู้จอง</p>
                <p className="font-semibold">{selectedBooking.username}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">อีเมล</p>
                <p className="font-semibold text-sm">{selectedBooking.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">เบอร์โทร</p>
                <p className="font-semibold">{selectedBooking.phone || '-'}</p>
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
                  {dayjs(selectedBooking.booking_date).format('DD/MM/YYYY')}
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
    </div>
  );
};

export default ManageBookings;