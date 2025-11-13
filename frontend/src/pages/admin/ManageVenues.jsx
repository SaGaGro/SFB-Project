import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  Switch,
  message,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../../services/api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 🆕 State สำหรับจัดการรูปภาพ
  const [imageFileList, setImageFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get("/venues");
      setVenues(response.data || []);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลสนามได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVenue(null);
    form.resetFields();
    setImageFileList([]); // 🆕 Reset รูปภาพ
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingVenue(record);
    form.setFieldsValue({
      ...record,
      opening_time: record.opening_time
        ? dayjs(record.opening_time, "HH:mm")
        : null,
      closing_time: record.closing_time
        ? dayjs(record.closing_time, "HH:mm")
        : null,
    });

    // 🆕 โหลดรูปภาพที่มีอยู่แล้ว
    if (record.images && record.images.length > 0) {
      const existingImages = record.images.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: "done",
        url: `${import.meta.env.VITE_BASE_URL}${url}`,
        existingUrl: url, // เก็บ URL เดิมไว้
      }));
      setImageFileList(existingImages);
    } else {
      setImageFileList([]);
    }

    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: "คุณแน่ใจหรือไม่ที่จะลบสนามนี้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          await api.delete(`/venues/${id}`);
          message.success("ลบสนามสำเร็จ");
          fetchVenues();
        } catch (error) {
          message.error("ไม่สามารถลบสนามได้");
        }
      },
    });
  };

  // 🆕 ฟังก์ชันจัดการ Upload รูปภาพ
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

  // 🆕 อัพโหลดรูปภาพไปยัง Backend
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const file of imageFileList) {
      // ถ้าเป็นรูปเดิมที่มีอยู่แล้ว ให้เก็บ URL เดิม
      if (file.existingUrl) {
        uploadedUrls.push(file.existingUrl);
        continue;
      }

      // ถ้าเป็นรูปใหม่ที่ยังไม่ได้อัพโหลด
      if (file.originFileObj) {
        const formData = new FormData();
        formData.append("venueImages", file.originFileObj);

        try {
          const response = await api.post("/upload/venue", formData, {
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

      // 🆕 อัพโหลดรูปภาพก่อน
      let imageUrls = [];
      if (imageFileList.length > 0) {
        imageUrls = await uploadImages();
      }

      const data = {
        ...values,
        opening_time: values.opening_time?.format("HH:mm"),
        closing_time: values.closing_time?.format("HH:mm"),
        images: imageUrls, // 🆕 ส่ง URL รูปภาพไปด้วย
      };

      if (editingVenue) {
        await api.put(`/venues/${editingVenue.venue_id}`, data);
        message.success("แก้ไขสนามสำเร็จ");
      } else {
        await api.post("/venues", data);
        message.success("เพิ่มสนามสำเร็จ");
      }

      setModalVisible(false);
      setImageFileList([]);
      fetchVenues();
    } catch (error) {
      message.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: "รหัส",
      dataIndex: "venue_id",
      key: "venue_id",
      width: 80,
    },
    {
      title: "รูปภาพ",
      key: "image",
      width: 100,
      render: (_, record) =>
        record.images && record.images.length > 0 ? (
          <Image
            width={60}
            height={60}
            src={`${import.meta.env.VITE_BASE_URL}${record.images[0]}`}
            alt={record.venue_name}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
          </div>
        ),
    },
    {
      title: "ชื่อสนาม",
      dataIndex: "venue_name",
      key: "venue_name",
    },
    {
      title: "ประเภท",
      dataIndex: "venue_type",
      key: "venue_type",
      render: (type) => {
        const types = {
          badminton: { color: "orange", text: "แบดมินตัน" },
          futsal: { color: "blue", text: "ฟุตซอล" },
          basketball: { color: "red", text: "บาสเกตบอล" },
          other: { color: "green", text: "อื่นๆ" },
        };
        const { color, text } = types[type] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "เวลาเปิด-ปิด",
      key: "time",
      render: (_, record) => `${record.opening_time} - ${record.closing_time}`,
    },
    {
      title: "คอร์ท",
      dataIndex: "court_count",
      key: "court_count",
      width: 120,
      render: (count, record) => (
        <Button
          size="small"
          onClick={() =>
            navigate("/admin/courts", {
              state: {
                venueId: record.venue_id,
                venueName: record.venue_name,
              },
            })
          }
        >
          {count || 0} คอร์ท
        </Button>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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
            onClick={() => handleDelete(record.venue_id)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  // 🆕 Upload Props สำหรับ Ant Design Upload
  const uploadProps = {
    listType: "picture-card",
    fileList: imageFileList,
    onChange: handleImageChange,
    onPreview: handlePreview,
    onRemove: handleRemoveImage,
    beforeUpload: () => false, // ป้องกันการ upload อัตโนมัติ
    multiple: true,
    accept: "image/*",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">จัดการสนาม</h2>
          <p className="text-gray-600">เพิ่ม แก้ไข และลบสนามกีฬา</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-red-600 hover:bg-red-700"
        >
          เพิ่มสนาม
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={venues}
        rowKey="venue_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingVenue ? "แก้ไขสนาม" : "เพิ่มสนามใหม่"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setImageFileList([]);
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="ชื่อสนาม"
            name="venue_name"
            rules={[{ required: true, message: "กรุณากรอกชื่อสนาม" }]}
          >
            <Input placeholder="เช่น สนามแบดมินตันสาขา 1" />
          </Form.Item>

          <Form.Item
            label="ประเภทสนาม"
            name="venue_type"
            rules={[{ required: true, message: "กรุณาเลือกประเภทสนาม" }]}
          >
            <Select placeholder="เลือกประเภทสนาม">
              <Option value="badminton">แบดมินตัน</Option>
              <Option value="futsal">ฟุตซอล</Option>
              <Option value="basketball">บาสเกตบอล</Option>
              <Option value="other">อื่นๆ</Option>
            </Select>
          </Form.Item>

          <Form.Item label="สถานที่" name="location">
            <Input placeholder="ที่อยู่สนาม" />
          </Form.Item>

          <Form.Item label="รายละเอียด" name="description">
            <TextArea rows={4} placeholder="รายละเอียดเพิ่มเติม" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="เวลาเปิด" name="opening_time">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>

            <Form.Item label="เวลาปิด" name="closing_time">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            label="สถานะ"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="เปิด" unCheckedChildren="ปิด" />
          </Form.Item>

          {/* 🆕 Upload รูปภาพ */}
          <Form.Item label="รูปภาพสนาม (สูงสุด 10 รูป)">
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

      {/* 🆕 Modal Preview รูปภาพ */}
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

export default ManageVenues;
