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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom"; // 🆕 เพิ่ม useLocation
import api from "../../../services/api";

const { Option } = Select;

const ManageCourts = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🆕 รับ state จาก navigate
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [form] = Form.useForm();

  // State สำหรับจัดการรูปภาพ
  const [imageFileList, setImageFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    // 🆕 ตั้งค่า selectedVenue จาก state ที่ส่งมา
    if (location.state?.venueId && venues.length > 0) {
      setSelectedVenue(location.state.venueId);
    }
  }, [location.state, venues]);

  useEffect(() => {
    if (selectedVenue) {
      fetchCourts(selectedVenue);
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      const response = await api.get("/venues");
      setVenues(response.data || []);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลสนามได้");
    }
  };

  const fetchCourts = async (venueId) => {
    setLoading(true);
    try {
      const response = await api.get(`/courts?venueId=${venueId}`);
      setCourts(response.data || []);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลคอร์ทได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedVenue) {
      message.warning("กรุณาเลือกสนามก่อน");
      return;
    }
    setEditingCourt(null);
    form.resetFields();
    form.setFieldsValue({ venue_id: selectedVenue });
    setImageFileList([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingCourt(record);
    form.setFieldsValue(record);

    // โหลดรูปภาพที่มีอยู่แล้ว
    try {
      const response = await api.get(`/courts/${record.court_id}`);
      if (response.data.images && response.data.images.length > 0) {
        const existingImages = response.data.images.map((url, index) => ({
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
    } catch (error) {
      setImageFileList([]);
    }

    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: "คุณแน่ใจหรือไม่ที่จะลบคอร์ทนี้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          await api.delete(`/courts/${id}`);
          message.success("ลบคอร์ทสำเร็จ");
          fetchCourts(selectedVenue);
        } catch (error) {
          message.error("ไม่สามารถลบคอร์ทได้");
        }
      },
    });
  };

  // ฟังก์ชันจัดการ Upload รูปภาพ
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

  const handleRemoveImage = (file) => {
    const newFileList = imageFileList.filter((item) => item.uid !== file.uid);
    setImageFileList(newFileList);
  };

  // อัพโหลดรูปภาพไปยัง Backend
  const uploadImages = async (courtId) => {
    const uploadedUrls = [];

    for (const file of imageFileList) {
      if (file.existingUrl) {
        uploadedUrls.push(file.existingUrl);
        continue;
      }

      if (file.originFileObj) {
        const formData = new FormData();
        formData.append("courtImages", file.originFileObj);
        formData.append("courtId", courtId);

        try {
          const response = await api.post("/upload/court", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (response.success && response.data.images) {
            uploadedUrls.push(...response.data.images);
          }
        } catch (error) {
          console.error("Upload error:", error);
          throw new Error("ไม่สามารถอัพโหลดรูปภาพได้");
        }
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (values) => {
    try {
      setUploading(true);

      if (editingCourt) {
        // แก้ไขคอร์ท
        await api.put(`/courts/${editingCourt.court_id}`, values);

        // อัพโหลดรูปภาพ
        if (imageFileList.length > 0) {
          await uploadImages(editingCourt.court_id);
        }

        message.success("แก้ไขคอร์ทสำเร็จ");
      } else {
        // สร้างคอร์ทใหม่
        const response = await api.post("/courts", values);
        const newCourtId = response.data.courtId;

        // อัพโหลดรูปภาพ
        if (imageFileList.length > 0) {
          await uploadImages(newCourtId);
        }

        message.success("เพิ่มคอร์ทสำเร็จ");
      }

      setModalVisible(false);
      setImageFileList([]);
      fetchCourts(selectedVenue);
    } catch (error) {
      message.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: "รหัส",
      dataIndex: "court_id",
      key: "court_id",
      width: 80,
    },
    {
      title: "ชื่อคอร์ท",
      dataIndex: "court_name",
      key: "court_name",
    },
    {
      title: "ราคา/ชั่วโมง",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      render: (rate) => `${parseFloat(rate).toLocaleString()} บาท`,
    },
    {
      title: "จำนวนคน",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => (capacity ? `${capacity} คน` : "-"),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "available" ? "green" : "red"}>
          {status === "available" ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
        </Tag>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
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

  const selectedVenueData = venues.find((v) => v.venue_id === selectedVenue);

  // Upload Props
  const uploadProps = {
    listType: "picture-card",
    fileList: imageFileList,
    onChange: handleImageChange,
    onPreview: handlePreview,
    onRemove: handleRemoveImage,
    beforeUpload: () => false,
    multiple: true,
    accept: "image/*",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/venues")}
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
            {venues.map((venue) => (
              <Option key={venue.venue_id} value={venue.venue_id}>
                {venue.venue_name} ({venue.venue_type})
              </Option>
            ))}
          </Select>
        </div>

        {/* 🆕 แสดงข้อมูลสนามที่เลือก */}
        {selectedVenueData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-1">
                  {selectedVenueData.venue_name}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">⏰ เวลาเปิด-ปิด:</span>
                    <span>{selectedVenueData.opening_time} - {selectedVenueData.closing_time} น.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">📍 สถานที่:</span>
                    <span>{selectedVenueData.location || "-"}</span>
                  </p>
                </div>
              </div>
              <div className="text-center bg-white px-6 py-3 rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-blue-600">{courts.length}</p>
                <p className="text-sm text-gray-600">คอร์ท</p>
              </div>
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
          locale={{
            emptyText: selectedVenue
              ? "ยังไม่มีคอร์ทในสนามนี้"
              : "กรุณาเลือกสนามก่อน",
          }}
        />
      </Card>

      <Modal
        title={editingCourt ? "แก้ไขคอร์ท" : "เพิ่มคอร์ทใหม่"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setImageFileList([]);
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={700}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="venue_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="ชื่อคอร์ท"
            name="court_name"
            rules={[{ required: true, message: "กรุณากรอกชื่อคอร์ท" }]}
          >
            <Input placeholder="เช่น คอร์ท 1, คอร์ท A" />
          </Form.Item>

          <Form.Item
            label="ราคาต่อชั่วโมง (บาท)"
            name="hourly_rate"
            rules={[{ required: true, message: "กรุณากรอกราคา" }]}
          >
            <InputNumber
              min={0}
              step={50}
              className="w-full"
              placeholder="เช่น 200"
            />
          </Form.Item>

          <Form.Item label="จำนวนคนที่รองรับ" name="capacity">
            <InputNumber min={1} className="w-full" placeholder="เช่น 10" />
          </Form.Item>

          <Form.Item
            label="สถานะ"
            name="status"
            initialValue="available"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select>
              <Option value="available">พร้อมใช้งาน</Option>
              <Option value="unavailable">ไม่พร้อมใช้งาน</Option>
            </Select>
          </Form.Item>

          {/* Upload รูปภาพคอร์ท */}
          <Form.Item label="รูปภาพคอร์ท (สูงสุด 10 รูป)">
            <Upload {...uploadProps}>
              {imageFileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>อัพโหลด</div>
                </div>
              )}
            </Upload>
            <p className="text-gray-500 text-sm mt-2">
              รองรับไฟล์: JPG, PNG, GIF (สูงสุด 5MB/ไฟล์)
            </p>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Preview รูปภาพ */}
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

export default ManageCourts;