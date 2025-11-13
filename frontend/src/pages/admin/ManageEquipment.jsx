import { useEffect, useState } from "react";
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
  Card,
  Upload,
  Image,
  Tooltip,
  Row,
  Col,
  Statistic,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../../services/api";

const { Option } = Select;

const ManageEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [form] = Form.useForm();
  const [venueFilter, setVenueFilter] = useState(null);

  // Image upload states
  const [imageFileList, setImageFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEquipment();
    fetchVenues();
  }, [venueFilter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = venueFilter ? { venueId: venueFilter } : {};
      const response = await api.get("/equipment", { params });
      setEquipment(response.data || []);
    } catch (error) {
      message.error(error.message || "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get("/venues");
      setVenues(response.data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const handleCreate = () => {
    setEditingEquipment(null);
    form.resetFields();
    setImageFileList([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingEquipment(record);
    form.setFieldsValue({
      venue_id: record.venue_id,
      equipment_name: record.equipment_name,
      stock: record.stock,
      rental_price: record.rental_price,
      is_active: record.is_active === 1,
    });

    // Load existing images
    if (record.images && record.images.length > 0) {
      const existingImages = record.images.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: "done",
        url: `${import.meta.env.VITE_BASE_URL}${url}`,
        existingUrl: url,
      }));
      setImageFileList(existingImages);
    } else {
      setImageFileList([]);
    }

    setModalVisible(true);
  };

  const handleToggleStatus = async (record) => {
    try {
      const response = await api.patch(`/equipment/${record.equipment_id}/toggle`);
      const newStatus = response.data.is_active;
      
      message.success(
        newStatus === 1 
          ? "เปิดใช้งานอุปกรณ์สำเร็จ" 
          : "ปิดใช้งานอุปกรณ์สำเร็จ"
      );
      
      fetchEquipment();
    } catch (error) {
      message.error(error.message || "ไม่สามารถเปลี่ยนสถานะอุปกรณ์ได้");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Upload images first
      const uploadedImageUrls = await uploadImages();

      const equipmentData = {
        ...values,
        is_active: values.is_active ? 1 : 0,
        images: uploadedImageUrls,
      };

      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.equipment_id}`, equipmentData);
        message.success("แก้ไขอุปกรณ์สำเร็จ");
      } else {
        await api.post("/equipment", equipmentData);
        message.success("เพิ่มอุปกรณ์สำเร็จ");
      }

      setModalVisible(false);
      fetchEquipment();
    } catch (error) {
      if (error.errorFields) {
        message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      } else {
        message.error(error.message || "เกิดข้อผิดพลาด");
      }
    }
  };

  // Upload images to server
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const file of imageFileList) {
      // ถ้าเป็นรูปเดิมที่มีอยู่แล้ว
      if (file.existingUrl) {
        uploadedUrls.push(file.existingUrl);
        continue;
      }

      // ถ้าเป็นรูปใหม่ที่ยังไม่ได้ upload
      if (file.originFileObj) {
        try {
          const formData = new FormData();
          formData.append("file", file.originFileObj);

          const response = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (response.success && response.url) {
            uploadedUrls.push(response.url);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          message.error(`ไม่สามารถอัปโหลดรูปภาพ ${file.name} ได้`);
        }
      }
    }

    return uploadedUrls;
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setImageFileList(newFileList);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>อัปโหลด</div>
    </div>
  );

  // Calculate statistics
  const getStats = () => {
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter(item => item.is_active === 1).length;
    const totalStock = equipment.reduce((sum, item) => sum + item.stock, 0);
    const avgPrice = totalEquipment > 0
      ? equipment.reduce((sum, item) => sum + parseFloat(item.rental_price), 0) / totalEquipment
      : 0;

    return { totalEquipment, activeEquipment, totalStock, avgPrice };
  };

  const stats = getStats();

  const columns = [
    {
      title: "รูปภาพ",
      dataIndex: "images",
      key: "images",
      width: 120,
      render: (images) => {
        if (images && images.length > 0) {
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
              <Image.PreviewGroup>
                <Image
                  width={80}
                  height={80}
                  src={`${import.meta.env.VITE_BASE_URL}${images[0]}`}
                  alt="equipment"
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                  fallback="data:image/png;base64,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"
                />
                {images.slice(1).map((img, index) => (
                  <Image
                    key={index}
                    src={`${import.meta.env.VITE_BASE_URL}${img}`}
                    style={{ display: "none" }}
                  />
                ))}
              </Image.PreviewGroup>
              {images.length > 1 && (
                <div style={{ position: "absolute", top: 2, right: 2, backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                  +{images.length - 1}
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InboxOutlined style={{ fontSize: 30, color: "#bfbfbf" }} />
          </div>
        );
      },
    },
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: "equipment_name",
      key: "equipment_name",
      sorter: (a, b) => a.equipment_name.localeCompare(b.equipment_name),
    },
    {
      title: "สถานที่",
      dataIndex: "venue_name",
      key: "venue_name",
      sorter: (a, b) => a.venue_name.localeCompare(b.venue_name),
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "stock",
      key: "stock",
      width: 120,
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 5 ? "orange" : "red"}>
          {stock} ชิ้น
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "ราคาเช่า",
      dataIndex: "rental_price",
      key: "rental_price",
      width: 120,
      render: (price) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {parseFloat(price).toFixed(2)} บาท
        </span>
      ),
      sorter: (a, b) => a.rental_price - b.rental_price,
    },
    {
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (is_active) => (
        <Tag 
          icon={is_active === 1 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={is_active === 1 ? "success" : "default"}
        >
          {is_active === 1 ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
      filters: [
        { text: "เปิดใช้งาน", value: 1 },
        { text: "ปิดใช้งาน", value: 0 },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "การจัดการ",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <Button type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small">
              แก้ไข
            </Button>
          </Tooltip>
          {/* <Tooltip title={record.is_active === 1 ? "ปิดใช้งาน" : "เปิดใช้งาน"}>
            <Switch
              checked={record.is_active === 1}
              onChange={() => handleToggleStatus(record)}
              checkedChildren="เปิด"
              unCheckedChildren="ปิด"
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>
        <ShoppingOutlined /> จัดการอุปกรณ์
      </h1>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="อุปกรณ์ทั้งหมด"
              value={stats.totalEquipment}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix="รายการ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="เปิดใช้งาน"
              value={stats.activeEquipment}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix="รายการ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="สต็อกทั้งหมด"
              value={stats.totalStock}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#722ed1" }}
              suffix="ชิ้น"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="ราคาเช่าเฉลี่ย"
              value={stats.avgPrice.toFixed(2)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#faad14" }}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <Space size="middle" wrap>
          <Select
            placeholder="กรองตามสถานที่"
            style={{ width: 250 }}
            value={venueFilter}
            onChange={setVenueFilter}
            allowClear
          >
            {venues.map((venue) => (
              <Option key={venue.venue_id} value={venue.venue_id}>
                {venue.venue_name}
              </Option>
            ))}
          </Select>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            เพิ่มอุปกรณ์
          </Button>

          <Button onClick={fetchEquipment}>รีเฟรช</Button>
        </Space>
      </Card>

      {/* Equipment Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={equipment}
          rowKey="equipment_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal: Create/Edit Equipment */}
      <Modal
        title={editingEquipment ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingEquipment ? "บันทึก" : "เพิ่ม"}
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
          <Form.Item
            name="venue_id"
            label="สถานที่"
            rules={[{ required: true, message: "กรุณาเลือกสถานที่" }]}
          >
            <Select placeholder="เลือกสถานที่">
              {venues.map((venue) => (
                <Option key={venue.venue_id} value={venue.venue_id}>
                  {venue.venue_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="equipment_name"
            label="ชื่ออุปกรณ์"
            rules={[{ required: true, message: "กรุณากรอกชื่ออุปกรณ์" }]}
          >
            <Input placeholder="เช่น ลูกแบดมินตัน, ไม้เทนนิส" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="จำนวนสต็อก"
                rules={[{ required: true, message: "กรุณากรอกจำนวนสต็อก" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="จำนวนชิ้น"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rental_price"
                label="ราคาเช่า (บาท)"
                rules={[{ required: true, message: "กรุณากรอกราคาเช่า" }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="ราคาเช่าต่อชิ้น"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="is_active"
            label="สถานะการใช้งาน"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="เปิดใช้งาน" 
              unCheckedChildren="ปิดใช้งาน"
            />
          </Form.Item>

          <Form.Item label="รูปภาพอุปกรณ์">
            <Upload
              listType="picture-card"
              fileList={imageFileList}
              onChange={handleImageChange}
              onPreview={handlePreview}
              beforeUpload={() => false}
              maxCount={5}
            >
              {imageFileList.length >= 5 ? null : uploadButton}
            </Upload>
            <div style={{ marginTop: 8, color: "#666", fontSize: "12px" }}>
              อัปโหลดรูปภาพได้สูงสุด 5 รูป
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ManageEquipment;