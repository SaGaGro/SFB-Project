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
  // [แก้ไข] เปลี่ยนชื่อ state เพื่อเก็บการจองทั้งหมด
  const [allBookings, setAllBookings] = useState([]);
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

      // [แก้ไข] จัดเรียงข้อมูลทั้งหมด (เช่น ตาม ID ล่าสุด) และ set ข้อมูลทั้งหมด
      const sortedBookings = bookings.sort((a, b) => b.booking_id - a.booking_id);
      setAllBookings(sortedBookings);

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
      // [เพิ่มเติม] เพิ่มการจัดเรียง
      sorter: (a, b) => a.booking_id - b.booking_id,
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
      // [เพิ่มเติม] เพิ่มการจัดเรียง
      sorter: (a, b) => new Date(a.booking_date) - new Date(b.booking_date),
    },
    {
      title: 'ราคา',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `${parseFloat(price).toLocaleString()} บาท`,
      // [เพิ่มเติม] เพิ่มการจัดเรียง
      sorter: (a, b) => a.total_price - b.total_price,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        // [แก้ไข] เพิ่ม default case เผื่อมี status ที่ไม่รู้จัก
        const { color, text } = statusConfig[status] || { color: 'gray', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
      // [แก้ไข] เพิ่ม filters และ onFilter
      filters: Object.entries(statusConfig).map(([key, { text }]) => ({
        text: text,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
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

      {/* [แก้ไข] เปลี่ยนชื่อ Card และ Table */}
      <Card title="ข้อมูลการจองทั้งหมด">
        <Table
          columns={columns}
          // [แก้ไข] เปลี่ยน dataSource
          dataSource={allBookings}
          rowKey="booking_id"
          loading={loading}
          // [แก้ไข] เปิดใช้งาน pagination
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;