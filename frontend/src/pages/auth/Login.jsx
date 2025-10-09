import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Form, Input, Button, Checkbox, Alert } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FaDumbbell } from "react-icons/fa6";
import { FaFacebook, FaGoogle, FaLock } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { IoMdExit } from "react-icons/io";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore";
import Navbar from "../../components/common/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading, clearError } = useAuthStore();

  const from = location.state?.from || null;

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("✅ ผู้ใช้ยืนยันตัวตนแล้ว:", user);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onFinish = async (values) => {
    try {
      const response = await login(values.email, values.password);
      console.log("✅ การเข้าสู่ระบบสำเร็จ:", response);

      const userData = response.data.user;

      toast.success("🎉 เข้าสู่ระบบสำเร็จ! กำลังเข้าสู่หน้าหลัก...", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        if (from) {
          navigate(from, { replace: true });
        } else if (userData.role === "member") {
          navigate("/member/venues", { replace: true });
        } else if (userData.role === "admin" || userData.role === "manager") {
          navigate("/admin/dashboard", { replace: true });
        }
      }, 1000);
    } catch (err) {
      console.error("❌ ข้อผิดพลาดในการเข้าสู่ระบบ:", err);
      console.log("ออบเจ็กต์ข้อผิดพลาด:", err);
      console.log("ข้อความข้อผิดพลาด:", err.message);
      console.log("การตอบกลับข้อผิดพลาด:", err.response);

      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast.error(
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">❌</span>
            <strong className="text-base">เข้าสู่ระบบไม่สำเร็จ</strong>
          </div>
          <p className="text-sm mb-2">{errorMessage}</p>
          <div className="text-xs opacity-75 border-t border-red-200 pt-2 mt-2">
            💡 <strong>คำแนะนำ:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>ตรวจสอบอีเมลและรหัสผ่านให้ถูกต้อง</li>
              <li>ตรวจสอบว่าไม่ได้เปิด Caps Lock</li>
            </ul>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          closeButton: true,
          style: {
            minWidth: "350px",
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Alert */}
          {from && (
            <Alert
              message="กรุณาเข้าสู่ระบบ"
              description="คุณต้องเข้าสู่ระบบก่อนเพื่อทำการจองสนาม"
              type="info"
              showIcon
              className="mb-6 rounded-xl"
            />
          )}

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Icon Header */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <FaDumbbell className="text-white text-3xl" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="!text-3xl !font-bold !text-gray-800 !mb-2">
                ยินดีต้อนรับ
              </h1>
              <p className="text-gray-500 text-sm">
                เข้าสู่ระบบเพื่อเริ่มต้นการจองสนามกีฬา
              </p>
            </div>

            {/* Form */}
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              requiredMark={false}
            >
              {/* Email */}
              <Form.Item
                label={
                  <span className="text-gray-700 font-medium text-sm">
                    อีเมล
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input
                  prefix={<IoIosMail className="text-gray-400 text-lg" />}
                  placeholder="กรอกอีเมลของคุณ"
                  className="h-12 rounded-xl border-gray-300 hover:border-orange-400 focus:border-orange-500"
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label={
                  <span className="text-gray-700 font-medium text-sm">
                    รหัสผ่าน
                  </span>
                }
                name="password"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              >
                <Input.Password
                  prefix={<FaLock className="text-gray-400" />}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  className="h-12 rounded-xl border-gray-300 hover:border-orange-400 focus:border-orange-500"
                />
              </Form.Item>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-600 text-sm">
                    จดจำฉันไว้
                  </Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="!text-orange-500 !hover:text-orange-600 !text-sm !font-medium"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {/* Login Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<IoMdExit className="text-lg" />}
                  className="w-full btn-orange-gradient"
                >
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>

              {/* Continue with */}
              <div className="text-center text-gray-400 text-sm mb-4">
                หรือเข้าสู่ระบบด้วย
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Google */}
                <Button
                  className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-500 transition-all"
                  icon={<FaGoogle className="!text-lg !text-red-500" />}
                >
                  <span className="font-medium">Google</span>
                </Button>

                {/* Facebook */}
                <Button
                  className="h-12 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:text-blue-500 transition-all"
                  icon={<FaFacebook className="!text-lg !text-blue-600" />}
                >
                  <span className="font-medium">Facebook</span>
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600 text-sm">
                  ยังไม่มีบัญชี?{" "}
                </span>
                <Link
                  to="/register"
                  className="!text-orange-500 !hover:text-orange-600 !font-semibold !text-sm"
                >
                  สมัครสมาชิกที่นี่
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 ระบบจองสนามกีฬา - ระบบจองคอร์ทกีฬาออนไลน์</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;