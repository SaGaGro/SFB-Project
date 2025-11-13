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
  message,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  UserAddOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import api from "../../../services/api";
import useAuthStore from "../../stores/authStore";
import dayjs from "dayjs";

const { Option } = Select;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Role ของ user ที่ login อยู่
  const [form] = Form.useForm();

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchText]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchText) params.search = searchText;

      const response = await api.get("/users", { params });
      setUsers(response.data || []);
      setUserRole(response.userRole); // เก็บ role ของ user ที่ login
    } catch (error) {
      message.error(error.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (record) => {
    try {
      const response = await api.get(`/users/${record.user_id}`);
      setSelectedUser(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  const handleUpdateRole = (record) => {
    setSelectedUser(record);
    form.setFieldsValue({ role: record.role });
    setModalVisible(true);
  };

  const handleSubmitRole = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/users/${selectedUser.user_id}/role`, values);
      message.success("เปลี่ยน Role สำเร็จ");
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.message || "ไม่สามารถเปลี่ยน Role ได้");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("ลบผู้ใช้สำเร็จ");
      fetchUsers();
    } catch (error) {
      message.error(error.message || "ไม่สามารถลบผู้ใช้ได้");
    }
  };

  // Get role statistics
  const getRoleStats = () => {
    const stats = {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      member: users.filter((u) => u.role === "member").length,
    };
    return stats;
  };

  const stats = getRoleStats();

  // Role color mapping
  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      manager: "blue",
      member: "green",
    };
    return colors[role] || "default";
  };

  // Role icon mapping
  const getRoleIcon = (role) => {
    const icons = {
      admin: <CrownOutlined />,
      manager: <SafetyCertificateOutlined />,
      member: <UserOutlined />,
    };
    return icons[role] || <UserOutlined />;
  };

  const columns = [
    {
      title: "รูปภาพ",
      dataIndex: "profile_image",
      key: "profile_image",
      width: 80,
      render: (image, record) => (
        <Avatar
          size={50}
          src={image ? `${import.meta.env.VITE_BASE_URL}${image}` : null}
          icon={<UserOutlined />}
          style={{ backgroundColor: getRoleColor(record.role) }}
        />
      ),
    },
    {
      title: "ชื่อผู้ใช้",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "เบอร์โทร",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role === "admin"
            ? "เจ้าของ"
            : role === "manager"
            ? "ผู้จัดการ"
            : "สมาชิก"}
        </Tag>
      ),
      filters: [
        { text: "เจ้าของ", value: "admin" },
        { text: "ผู้จัดการ", value: "manager" },
        { text: "สมาชิก", value: "member" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "วันที่สมัคร",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "การจัดการ",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            />
          </Tooltip>

          {/* Admin เท่านั้นที่เปลี่ยน role ได้ */}
          {currentUser?.role === "admin" && (
            <Tooltip title="เปลี่ยน Role">
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => handleUpdateRole(record)}
                size="small"
              />
            </Tooltip>
          )}

          {/* ห้ามลบตัวเอง และ Manager ลบได้เฉพาะ member */}
          {record.user_id !== currentUser?.user_id &&
            (currentUser?.role === "admin" ||
              (currentUser?.role === "manager" && record.role === "member")) && (
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?"
                onConfirm={() => handleDelete(record.user_id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="ลบผู้ใช้">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Tooltip>
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>
        <TeamOutlined /> จัดการผู้ใช้งาน
      </h1>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ผู้ใช้ทั้งหมด"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="เจ้าของ"
              value={stats.admin}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ผู้จัดการ"
              value={stats.manager}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="สมาชิก"
              value={stats.member}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <Space size="middle" wrap>
          <Input
            placeholder="ค้นหาด้วยชื่อหรืออีเมล"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          {/* Admin เท่านั้นที่กรองตาม role ได้ */}
          {currentUser?.role === "admin" && (
            <Select
              placeholder="กรองตาม Role"
              style={{ width: 200 }}
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
            >
              <Option value="admin">เจ้าของ</Option>
              <Option value="manager">ผู้จัดการ</Option>
              <Option value="member">สมาชิก</Option>
            </Select>
          )}

          <Button onClick={fetchUsers}>รีเฟรช</Button>
        </Space>
      </Card>

      {/* User Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="user_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} ผู้ใช้`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal: Change Role */}
      <Modal
        title="เปลี่ยน Role ผู้ใช้"
        open={modalVisible}
        onOk={handleSubmitRole}
        onCancel={() => setModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ชื่อผู้ใช้">
            <Input value={selectedUser?.username} disabled />
          </Form.Item>
          <Form.Item label="อีเมล">
            <Input value={selectedUser?.email} disabled />
          </Form.Item>
          <Form.Item
            name="role"
            label="บทบาท"
            rules={[{ required: true, message: "กรุณาเลือก Role" }]}
          >
            <Select>
              <Option value="admin">
                <CrownOutlined /> เจ้าของ (Admin)
              </Option>
              <Option value="manager">
                <SafetyCertificateOutlined /> ผู้จัดการ (Manager)
              </Option>
              <Option value="member">
                <UserOutlined /> สมาชิก (Member)
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: User Details */}
      <Modal
        title="รายละเอียดผู้ใช้"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            ปิด
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar
                size={100}
                src={
                  selectedUser.profile_image
                    ? `${import.meta.env.VITE_BASE_URL}${
                        selectedUser.profile_image
                      }`
                    : null
                }
                icon={<UserOutlined />}
              />
              <h2 style={{ marginTop: "16px" }}>{selectedUser.username}</h2>
              <Tag color={getRoleColor(selectedUser.role)} icon={getRoleIcon(selectedUser.role)}>
                {selectedUser.role === "admin"
                  ? "เจ้าของ"
                  : selectedUser.role === "manager"
                  ? "ผู้จัดการ"
                  : "สมาชิก"}
              </Tag>
            </div>

            <Card>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <strong>อีเมล:</strong> {selectedUser.email}
                </Col>
                <Col span={24}>
                  <strong>เบอร์โทร:</strong> {selectedUser.phone || "-"}
                </Col>
                <Col span={24}>
                  <strong>วันที่สมัคร:</strong>{" "}
                  {dayjs(selectedUser.created_at).format("DD/MM/YYYY HH:mm")}
                </Col>
              </Row>
            </Card>

            {/* Booking Statistics */}
            {selectedUser.stats && (
              <Card title="สถิติการจอง" style={{ marginTop: "16px" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="จองทั้งหมด"
                      value={selectedUser.stats.total_bookings || 0}
                      suffix="ครั้ง"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="จองสำเร็จ"
                      value={selectedUser.stats.completed_bookings || 0}
                      suffix="ครั้ง"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="ยกเลิก"
                      value={selectedUser.stats.cancelled_bookings || 0}
                      suffix="ครั้ง"
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="ยอดเงินรวม"
                      value={selectedUser.stats.total_spent || 0}
                      suffix="บาท"
                      precision={2}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
