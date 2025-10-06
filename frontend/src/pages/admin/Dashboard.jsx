import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, message } from 'antd';
import { 
  CalendarOutlined, 
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import api from '../../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalVenues: 0,
    todayBookings: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, usersRes, venuesRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/users'),
        api.get('/venues'),
      ]);

      const bookings = bookingsRes.data || [];
      const users = usersRes.data || [];
      const venues = venuesRes.data || [];

      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => 
        b.booking_date?.startsWith(today)
      );

      setStats({
        totalBookings: bookings.length,
        totalRevenue: bookings
          .filter(b => b.status === 'paid')
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
        totalUsers: users.length,
        totalVenues: venues.length,
        todayBookings: todayBookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
      });

      setRecentBookings(bookings.slice(0, 10));
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
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
      title: 'วันที่',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (date) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'ราคา',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `${parseFloat(price).toLocaleString()} บาท`,
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">ภาพรวมของระบบ</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การจองทั้งหมด"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span className="text-xs text-green-600">
                  <ArrowUpOutlined /> {stats.todayBookings} วันนี้
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="บาท"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="สมาชิกทั้งหมด"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="สนามทั้งหมด"
              value={stats.totalVenues}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="รอชำระเงิน"
              value={stats.pendingBookings}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="จองวันนี้"
                value={stats.todayBookings}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="การจองล่าสุด">
        <Table
          columns={columns}
          dataSource={recentBookings}
          rowKey="booking_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;