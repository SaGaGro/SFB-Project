import { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Select,
  message,
  Card 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const { Option } = Select;

const ManageCourts = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchCourts(selectedVenue);
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลสนามได้');
    }
  };

  const fetchCourts = async (venueId) => {
    setLoading(true);
    try {
      const response = await api.get(`/courts?venueId=${venueId}`);
      setCourts(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลคอร์ทได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedVenue) {
      message.warning('กรุณาเลือกสนามก่อน');
      return;
    }
    setEditingCourt(null);
    form.resetFields();
    form.setFieldsValue({ venue_id: selectedVenue });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCourt(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: 'คุณแน่ใจหรือไม่ที่จะลบคอร์ทนี้',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await api.delete(`/courts/${id}`);
          message.success('ลบคอร์ทสำเร็จ');
          fetchCourts(selectedVenue);
        } catch (error) {
          message.error('ไม่สามารถลบคอร์ทได้');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCourt) {
        await api.put(`/courts/${editingCourt.court_id}`, values);
        message.success('แก้ไขคอร์ทสำเร็จ');
      } else {
        await api.post('/courts', values);
        message.success('เพิ่มคอร์ทสำเร็จ');
      }

      setModalVisible(false);
      fetchCourts(selectedVenue);
    } catch (error) {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  const columns = [
    {
      title: 'รหัส',
      dataIndex: 'court_id',
      key: 'court_id',
      width: 80,
    },
    {
      title: 'ชื่อคอร์ท',
      dataIndex: 'court_name',
      key: 'court_name',
    },
    {
      title: 'ราคา/ชั่วโมง',
      dataIndex: 'hourly_rate',
      key: 'hourly_rate',
      render: (rate) => `${parseFloat(rate).toLocaleString()} บาท`,
    },
    {
      title: 'จำนวนคน',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => capacity ? `${capacity} คน` : '-',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
          {status === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.court_id)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  const selectedVenueData = venues.find(v => v.venue_id === selectedVenue);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/venues')}
        >
          กลับ
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">จัดการคอร์ท</h2>
          <p className="text-gray-600">เพิ่ม แก้ไข และลบคอร์ทในแต่ละสนาม</p>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">เลือกสนาม</label>
          <Select
            size="large"
            placeholder="เลือกสนามที่ต้องการจัดการ"
            value={selectedVenue}
            onChange={setSelectedVenue}
            className="w-full max-w-md"
          >
            {venues.map(venue => (
              <Option key={venue.venue_id} value={venue.venue_id}>
                {venue.venue_name} ({venue.venue_type})
              </Option>
            ))}
          </Select>
        </div>

        {selectedVenueData && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">{selectedVenueData.venue_name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>เวลาเปิด-ปิด: {selectedVenueData.opening_time} - {selectedVenueData.closing_time} น.</p>
              <p>สถานที่: {selectedVenueData.location || '-'}</p>
              <p>จำนวนคอร์ท: {courts.length} คอร์ท</p>
            </div>
          </div>
        )}

        {selectedVenue && (
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="bg-red-600 hover:bg-red-700"
            >
              เพิ่มคอร์ท
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={courts}
          rowKey="court_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: selectedVenue ? 'ยังไม่มีคอร์ทในสนามนี้' : 'กรุณาเลือกสนามก่อน' }}
        />
      </Card>

      <Modal
        title={editingCourt ? 'แก้ไขคอร์ท' : 'เพิ่มคอร์ทใหม่'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="venue_id"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ชื่อคอร์ท"
            name="court_name"
            rules={[{ required: true, message: 'กรุณากรอกชื่อคอร์ท' }]}
          >
            <Input placeholder="เช่น คอร์ท 1, คอร์ท A" />
          </Form.Item>

          <Form.Item
            label="ราคาต่อชั่วโมง (บาท)"
            name="hourly_rate"
            rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
          >
            <InputNumber
              min={0}
              step={50}
              className="w-full"
              placeholder="เช่น 200"
            />
          </Form.Item>

          <Form.Item
            label="จำนวนคนที่รองรับ"
            name="capacity"
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder="เช่น 10"
            />
          </Form.Item>

          <Form.Item
            label="สถานะ"
            name="status"
            initialValue="available"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select>
              <Option value="available">พร้อมใช้งาน</Option>
              <Option value="unavailable">ไม่พร้อมใช้งาน</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCourts;