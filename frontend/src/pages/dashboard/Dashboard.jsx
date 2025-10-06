import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, message } from 'antd';
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import api from '../../../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      const bookingData = response.data || [];
      setBookings(bookingData);
      
      // คำนวณสถิติ
      const stats = {
        total: bookingData.length,
        pending: bookingData.filter(b => b.status === 'pending').length,
        confirmed: bookingData.filter(b => b.status === 'confirmed' || b.status === 'paid').length,
        totalSpent: bookingData
          .filter(b => b.status === 'paid')
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
      };
      setStats(stats);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'รหัสการจอง',
      dataIndex: 'booking_id',
      key: 'booking_id',
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
        const colorMap = {
          pending: 'orange',
          confirmed: 'blue',
          paid: 'green',
          cancelled: 'red',
        };
        const textMap = {
          pending: 'รอชำระเงิน',
          confirmed: 'ยืนยันแล้ว',
          paid: 'ชำระแล้ว',
          cancelled: 'ยกเลิก',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ยินดีต้อนรับ, {user?.username}! 👋</h1>
        <p className="text-gray-600">จัดการการจองและดูสถิติของคุณ</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การจองทั้งหมด"
              value={stats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รอชำระเงิน"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="สำเร็จแล้ว"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดเงินรวม"
              value={stats.totalSpent}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
              suffix="฿"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Card title="การจองล่าสุด" className="mt-6">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="booking_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;