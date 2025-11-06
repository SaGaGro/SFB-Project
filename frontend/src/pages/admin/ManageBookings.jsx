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
  DatePicker,
  Form,
  TimePicker,
  InputNumber,
  Descriptions,
  Divider
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EditOutlined,
  DollarOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmPaymentModalVisible, setConfirmPaymentModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Edit form
  const [editForm] = Form.useForm();
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  // Detail modal
  const [bookingEquipment, setBookingEquipment] = useState([]);

  // Cancel form
  const [cancelForm] = Form.useForm();

  // Confirm payment form
  const [confirmForm] = Form.useForm();

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(b =>
        b.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        b.venue_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        b.booking_id?.toString().includes(searchText)
      );
    }

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(b => {
        const bookingDate = dayjs(b.booking_date);
        return bookingDate.isAfter(dateRange[0].startOf('day')) &&
               bookingDate.isBefore(dateRange[1].endOf('day'));
      });
    }

    setFilteredBookings(filtered);
  };

  // ดูรายละเอียด
  const handleViewDetail = async (record) => {
    setSelectedBooking(record);

    // โหลดข้อมูลอุปกรณ์
    try {
      const bookingDetail = await api.get(`/bookings/${record.booking_id}`);
      setBookingEquipment(bookingDetail.data?.equipment || []);
    } catch (error) {
      console.error('Error loading booking equipment:', error);
      setBookingEquipment([]);
    }

    setDetailModalVisible(true);
  };

  // แก้ไขการจอง
  const handleEdit = async (record) => {
    setSelectedBooking(record);

    // ดึงข้อมูลคอร์ทของสนามนี้
    try {
      const courtsRes = await api.get(`/courts?venueId=${record.venue_id}`);
      setCourts(courtsRes.data || []);

      const equipmentRes = await api.get(`/equipment?venueId=${record.venue_id}`);
      setEquipment(equipmentRes.data || []);

      // ดึงข้อมูลอุปกรณ์ที่จองไว้
      const bookingDetail = await api.get(`/bookings/${record.booking_id}`);
      const bookedEquipment = bookingDetail.data?.equipment || [];
      setSelectedEquipment(bookedEquipment);

      // คำนวณระยะเวลา
      const startTime = dayjs(record.start_time, 'HH:mm');
      const endTime = dayjs(record.end_time, 'HH:mm');
      const durationInHours = endTime.diff(startTime, 'hour', true);

      editForm.setFieldsValue({
        booking_date: dayjs(record.booking_date),
        start_time: dayjs(record.start_time, 'HH:mm'),
        duration: durationInHours,
        court_id: record.court_id,
      });

      setEditModalVisible(true);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้');
    }
  };

  const handleUpdateBooking = async () => {
    try {
      const values = await editForm.validateFields();

      // คำนวณเวลาสิ้นสุดจากเวลาเริ่มและระยะเวลา
      const startTime = values.start_time;
      const endTime = startTime.add(values.duration, 'hour');

      const updateData = {
        booking_date: values.booking_date.format('YYYY-MM-DD'),
        start_time: startTime.format('HH:mm'),
        end_time: endTime.format('HH:mm'),
        court_id: values.court_id,
        equipment: selectedEquipment,
      };

      await api.put(`/bookings/${selectedBooking.booking_id}`, updateData);
      message.success('แก้ไขการจองสำเร็จ');
      setEditModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error(error.message || 'ไม่สามารถแก้ไขการจองได้');
    }
  };

  // ยืนยันการชำระเงิน
  const handleConfirmPayment = (record) => {
    setSelectedBooking(record);
    confirmForm.resetFields();
    setConfirmPaymentModalVisible(true);
  };

  const handleConfirmPaymentSubmit = async () => {
    try {
      const values = await confirmForm.validateFields();

      await api.post(`/bookings/${selectedBooking.booking_id}/confirm-payment`, {
        note: values.note,
      });

      message.success('ยืนยันการชำระเงินสำเร็จ');
      setConfirmPaymentModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error(error.message || 'ไม่สามารถยืนยันการชำระเงินได้');
    }
  };

  // ยกเลิกการจอง
  const handleCancel = (record) => {
    setSelectedBooking(record);
    cancelForm.resetFields();
    setCancelModalVisible(true);
  };

  const handleCancelBooking = async () => {
    try {
      const values = await cancelForm.validateFields();

      await api.put(`/bookings/${selectedBooking.booking_id}/cancel`, {
        cancellation_reason: values.cancellation_reason,
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
      title: 'รหัส',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 80,
      sorter: (a, b) => a.booking_id - b.booking_id,
    },
    {
      title: 'ผู้จอง',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
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
      sorter: (a, b) => dayjs(a.booking_date).unix() - dayjs(b.booking_date).unix(),
    },
    {
      title: 'เวลา',
      key: 'time',
      render: (_, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: 'อุปกรณ์',
      key: 'equipment',
      width: 120,
      render: (_, record) => {
        if (!record.equipment || record.equipment.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="text-xs">
            {record.equipment.slice(0, 2).map((item, index) => (
              <div key={index} className="text-gray-700">
                {item.equipment_name} x{item.quantity}
              </div>
            ))}
            {record.equipment.length > 2 && (
              <span className="text-blue-600">+{record.equipment.length - 2} อื่นๆ</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'ราคา',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => (
        <span className="font-semibold text-green-600">
          {parseFloat(price).toLocaleString()} บาท
        </span>
      ),
      sorter: (a, b) => parseFloat(a.total_price) - parseFloat(b.total_price),
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
      width: 300,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            ดู
          </Button>

          {record.status !== 'cancelled' && (
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              แก้ไข
            </Button>
          )}

          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmPayment(record)}
              className="bg-green-600 hover:bg-green-700"
            >
              ยืนยันชำระเงิน
            </Button>
          )}

          {record.status !== 'cancelled' && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancel(record)}
            >
              ยกเลิก
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

      {/* Stats Cards */}
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

      {/* Filters */}
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
              placeholder="กรองตามสถานะ"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="pending">รอชำระเงิน</Option>
              <Option value="paid">ชำระแล้ว</Option>
              <Option value="confirmed">ยืนยันแล้ว</Option>
              <Option value="cancelled">ยกเลิก</Option>
            </Select>

            <RangePicker
              placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="booking_id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`รายละเอียดการจอง #${selectedBooking?.booking_id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            ปิด
          </Button>
        ]}
        width={700}
      >
        {selectedBooking && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="รหัสการจอง" span={2}>
                #{selectedBooking.booking_id}
              </Descriptions.Item>
              <Descriptions.Item label="ผู้จอง">
                {selectedBooking.username}
              </Descriptions.Item>
              <Descriptions.Item label="อีเมล">
                {selectedBooking.email}
              </Descriptions.Item>
              <Descriptions.Item label="สนาม">
                {selectedBooking.venue_name}
              </Descriptions.Item>
              <Descriptions.Item label="คอร์ท">
                {selectedBooking.court_name}
              </Descriptions.Item>
              <Descriptions.Item label="วันที่">
                {dayjs(selectedBooking.booking_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="เวลา">
                {selectedBooking.start_time} - {selectedBooking.end_time} น.
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ" span={2}>
                <Tag color={statusConfig[selectedBooking.status]?.color}>
                  {statusConfig[selectedBooking.status]?.text}
                </Tag>
              </Descriptions.Item>
              {selectedBooking.cancellation_reason && (
                <Descriptions.Item label="เหตุผลการยกเลิก" span={2}>
                  {selectedBooking.cancellation_reason}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left">รายละเอียดค่าใช้จ่าย</Divider>

            <div className="space-y-3">
              {/* ค่าเช่าสนาม/คอร์ท */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">ค่าเช่าสนาม</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedBooking.court_name} ({selectedBooking.start_time} - {selectedBooking.end_time})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-xl">
                      {(() => {
                        const startTime = dayjs(selectedBooking.start_time, 'HH:mm');
                        const endTime = dayjs(selectedBooking.end_time, 'HH:mm');
                        const hours = endTime.diff(startTime, 'hour', true);
                        const courtPrice = parseFloat(selectedBooking.total_price || 0);
                        const equipmentTotal = bookingEquipment.reduce((sum, item) => {
                          const rentalPrice = parseFloat(item.rental_price || item.price || 0);
                          const quantity = parseInt(item.quantity || 0);
                          return sum + (quantity * rentalPrice);
                        }, 0);
                        const courtOnlyPrice = courtPrice - equipmentTotal;
                        return courtOnlyPrice.toLocaleString();
                      })()} บาท
                    </p>
                  </div>
                </div>
              </div>

              {/* ค่าเช่าอุปกรณ์ */}
              {bookingEquipment && bookingEquipment.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-gray-800 text-lg mb-3">ค่าเช่าอุปกรณ์</p>
                  <div className="space-y-2">
                    {bookingEquipment.map((item, index) => {
                      const rentalPrice = parseFloat(item.rental_price || item.price || 0);
                      const quantity = parseInt(item.quantity || 0);
                      const totalPrice = quantity * rentalPrice;

                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.equipment_name}</p>
                            <p className="text-sm text-gray-600">
                              {quantity} ชิ้น × {rentalPrice.toLocaleString()} บาท
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-700">
                              {totalPrice.toLocaleString()} บาท
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-green-300">
                      <p className="font-semibold text-gray-800">รวมค่าอุปกรณ์</p>
                      <p className="font-bold text-green-600 text-lg">
                        {bookingEquipment
                          .reduce((sum, item) => {
                            const rentalPrice = parseFloat(item.rental_price || item.price || 0);
                            const quantity = parseInt(item.quantity || 0);
                            return sum + (quantity * rentalPrice);
                          }, 0)
                          .toLocaleString()}{' '}
                        บาท
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {bookingEquipment.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-center">ไม่มีการเช่าอุปกรณ์</p>
                </div>
              )}

              {/* ราคารวมทั้งหมด */}
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold text-lg">ราคารวมทั้งหมด</p>
                    <p className="text-white text-sm opacity-90">
                      (ค่าสนาม + ค่าอุปกรณ์)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-3xl">
                      {parseFloat(selectedBooking.total_price).toLocaleString()} บาท
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`แก้ไขการจอง #${selectedBooking?.booking_id}`}
        open={editModalVisible}
        onOk={handleUpdateBooking}
        onCancel={() => setEditModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="วันที่จอง"
            name="booking_date"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="เวลาเริ่ม"
              name="start_time"
              rules={[{ required: true, message: 'กรุณาเลือกเวลาเริ่ม' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={30}
                style={{ width: '100%' }}
                disabledTime={() => {
                  const selectedDate = editForm.getFieldValue('booking_date');
                  const now = dayjs();

                  return {
                    disabledHours: () => {
                      const hours = [];

                      // จำกัดเวลา 8:00 - 23:00
                      for (let i = 0; i < 8; i++) {
                        hours.push(i);
                      }
                      for (let i = 23; i < 24; i++) {
                        hours.push(i);
                      }

                      // ถ้าเลือกวันนี้ ห้ามเลือกเวลาที่ผ่านไปแล้ว
                      if (selectedDate && selectedDate.isSame(now, 'day')) {
                        const currentHour = now.hour();
                        for (let i = 8; i < currentHour; i++) {
                          if (!hours.includes(i)) {
                            hours.push(i);
                          }
                        }
                      }

                      return hours;
                    },
                    disabledMinutes: (selectedHour) => {
                      const selectedDate = editForm.getFieldValue('booking_date');
                      const now = dayjs();

                      // ถ้าเลือกวันนี้และเลือกชั่วโมงปัจจุบัน
                      if (selectedDate && selectedDate.isSame(now, 'day') && selectedHour === now.hour()) {
                        const currentMinute = now.minute();
                        const minutes = [];
                        for (let i = 0; i <= currentMinute; i++) {
                          minutes.push(i);
                        }
                        return minutes;
                      }

                      return [];
                    },
                  };
                }}
              />
            </Form.Item>

            <Form.Item
              label="ระยะเวลา"
              name="duration"
              rules={[{ required: true, message: 'กรุณาเลือกระยะเวลา' }]}
            >
              <Select placeholder="เลือกระยะเวลา" style={{ width: '100%' }}>
                <Option value={1}>1 ชั่วโมง</Option>
                <Option value={1.5}>1 ชั่วโมง 30 นาที</Option>
                <Option value={2}>2 ชั่วโมง</Option>
                <Option value={2.5}>2 ชั่วโมง 30 นาที</Option>
                <Option value={3}>3 ชั่วโมง</Option>
                <Option value={3.5}>3 ชั่วโมง 30 นาที</Option>
                <Option value={4}>4 ชั่วโมง</Option>
                <Option value={4.5}>4 ชั่วโมง 30 นาที</Option>
                <Option value={5}>5 ชั่วโมง</Option>
                <Option value={5.5}>5 ชั่วโมง 30 นาที</Option>
                <Option value={6}>6 ชั่วโมง</Option>
                <Option value={6.5}>6 ชั่วโมง 30 นาที</Option>
                <Option value={7}>7 ชั่วโมง</Option>
                <Option value={7.5}>7 ชั่วโมง 30 นาที</Option>
                <Option value={8}>8 ชั่วโมง</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="คอร์ท"
            name="court_id"
            rules={[{ required: true, message: 'กรุณาเลือกคอร์ท' }]}
          >
            <Select placeholder="เลือกคอร์ท">
              {courts.map(court => (
                <Option key={court.court_id} value={court.court_id}>
                  {court.court_name} - {court.hourly_rate} บาท/ชม.
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>อุปกรณ์เสริม</Divider>

          {equipment.map(item => (
            <div key={item.equipment_id} className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.equipment_name}</p>
                <p className="text-sm text-gray-600">
                  {item.rental_price} บาท/ชิ้น (เหลือ {item.stock} ชิ้น)
                </p>
              </div>
              <InputNumber
                min={0}
                max={item.stock}
                value={
                  selectedEquipment.find(e => e.equipment_id === item.equipment_id)?.quantity || 0
                }
                onChange={(value) => {
                  const newEquipment = [...selectedEquipment];
                  const index = newEquipment.findIndex(e => e.equipment_id === item.equipment_id);

                  if (value > 0) {
                    if (index >= 0) {
                      newEquipment[index].quantity = value;
                    } else {
                      newEquipment.push({ equipment_id: item.equipment_id, quantity: value });
                    }
                  } else {
                    if (index >= 0) {
                      newEquipment.splice(index, 1);
                    }
                  }

                  setSelectedEquipment(newEquipment);
                }}
                style={{ width: 100 }}
              />
            </div>
          ))}
        </Form>
      </Modal>

      {/* Confirm Payment Modal */}
      <Modal
        title={`ยืนยันการชำระเงิน #${selectedBooking?.booking_id}`}
        open={confirmPaymentModalVisible}
        onOk={handleConfirmPaymentSubmit}
        onCancel={() => setConfirmPaymentModalVisible(false)}
        okText="ยืนยันการชำระเงิน"
        cancelText="ยกเลิก"
        okButtonProps={{ icon: <DollarOutlined /> }}
      >
        <p className="mb-4">
          คุณกำลังยืนยันการชำระเงินสำหรับการจอง <strong>#{selectedBooking?.booking_id}</strong>
        </p>
        <p className="mb-4 text-gray-600">
          จำนวนเงิน: <span className="font-bold text-green-600 text-lg">
            {parseFloat(selectedBooking?.total_price || 0).toLocaleString()} บาท
          </span>
        </p>

        <Form form={confirmForm} layout="vertical">
          <Form.Item
            label="หมายเหตุ (ถ้ามี)"
            name="note"
          >
            <TextArea
              rows={3}
              placeholder="เช่น: ชำระผ่าน QR Code, โอนเงินแล้ว, ชำระเงินสด ฯลฯ"
            />
          </Form.Item>
        </Form>

        <p className="text-sm text-orange-600 mt-4">
          ⚠️ <strong>หมายเหตุ:</strong> เมื่อกดยืนยันแล้ว สถานะการจองจะเปลี่ยนเป็น "ชำระแล้ว" ทันที
        </p>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={`ยกเลิกการจอง #${selectedBooking?.booking_id}`}
        open={cancelModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-4">
          คุณกำลังยกเลิกการจอง <strong>#{selectedBooking?.booking_id}</strong>
        </p>

        <Form form={cancelForm} layout="vertical">
          <Form.Item
            label="เหตุผลการยกเลิก"
            name="cancellation_reason"
            rules={[{ required: true, message: 'กรุณาระบุเหตุผล' }]}
          >
            <TextArea
              rows={4}
              placeholder="ระบุเหตุผลการยกเลิก..."
            />
          </Form.Item>
        </Form>

        <p className="text-sm text-red-600 mt-4">
          ⚠️ <strong>หมายเหตุ:</strong> การยกเลิกจะคืนสต็อกอุปกรณ์และปล่อยช่วงเวลาให้ว่าง
        </p>
      </Modal>
    </div>
  );
};

export default ManageBookings;
