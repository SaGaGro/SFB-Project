import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Dropdown, Avatar } from "antd";
import logo from "../../assets/logo/logo2.svg";
import {
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  SettingOutlined,
  DashboardOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // กำหนด path สำหรับ Logo ตาม role
  const getLogoPath = () => {
    if (!isAuthenticated) return "/";
    if (user?.role === "member") return "/member/venues";
    if (user?.role === "admin" || user?.role === "manager")
      return "/admin/dashboard";
    return "/";
  };

  const getMemberMenuItems = () => [
    {
      key: "venues",
      icon: <ShopOutlined />,
      label: "เลือกสนาม",
      onClick: () => navigate("/member/venues"),
    },
    {
      key: "bookings",
      icon: <CalendarOutlined />,
      label: "การจองของฉัน",
      onClick: () => navigate("/member/my-bookings"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "โปรไฟล์",
      onClick: () => navigate("/member/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getAdminMenuItems = () => [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "จัดการระบบ",
      onClick: () => navigate("/admin/venues"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const userMenuItems =
    user?.role === "member" ? getMemberMenuItems() : getAdminMenuItems();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="bg-gradient-to-r from-orange-600 via-orange-600 to-orange-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Redirect ตาม role */}
          <Link
            to={getLogoPath()}
            className="flex items-center space-x-3 group"
          >
            <img
              src={logo}
              alt="Ignite Pro Logo"
              className="h-full max-h-[60px] object-contain"
            />
            <div>
              <span className="text-2xl font-bold text-white drop-shadow-md">
                Ignite Pro
              </span>
              <p className="text-xs text-green-100">ระบบจองคอร์ทกีฬาออนไลน์</p>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            {/* แสดงลิงก์หน้าแรกเฉพาะตอนยังไม่ Login */}
            {!isAuthenticated && (
              <Link
                to="/"
                className="text-white hover:text-green-100 transition-colors font-medium hidden sm:flex items-center gap-2"
              >
                <HomeOutlined />
                หน้าแรก
              </Link>
            )}

            {/* ลิงก์ดูสนาม */}
            {isAuthenticated && user?.role === "member" ? (
              <Link
                to="/member/venues"
                className=" !text-white hover:!text-black transition-colors font-medium hidden sm:flex items-center gap-2"
              >
                <EnvironmentOutlined className="!text-white" />
                ดูสนาม
              </Link>
            ) : (
              !isAuthenticated && (
                <Link
                  to="/venues"
                  className="text-white hover:text-green-100 transition-colors font-medium hidden sm:flex items-center gap-2"
                >
                  <EnvironmentOutlined />
                  ดูสนาม
                </Link>
              )
            )}

            {isAuthenticated ? (
              <>
                {user?.role === "member" ? (
                  <Link
                    to="/member/my-bookings"
                    className="!text-white hover:text-green-100 transition-colors font-medium hidden md:flex items-center gap-2"
                  >
                    <CalendarOutlined />
                    การจองของฉัน
                  </Link>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    className="text-white hover:text-green-100 transition-colors font-medium hidden md:flex items-center gap-2"
                  >
                    <DashboardOutlined />
                    จัดการระบบ
                  </Link>
                )}

                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                >
                  <div className="flex items-center space-x-3 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all">
                    <Avatar
                      icon={<UserOutlined />}
                      src={
                        user?.profile_image
                          ? `${import.meta.env.VITE_BASE_URL}${
                              user.profile_image
                            }`
                          : null
                      }
                      className="bg-green-500 border-2 border-white"
                    />
                    <div className="text-left hidden sm:block">
                      <div className="text-black text-sm font-semibold">
                        {user?.username}
                      </div>
                      <div className="!text-black-100 text-xs">
                        {user?.role === "member" ? "สมาชิก" : "ผู้จัดการ"}
                      </div>
                    </div>
                  </div>
                </Dropdown>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button
                      className="border-2 border-white text-white !hover:bg-white !hover:text-black font-semibold h-10 px-6 rounded-full"
                      ghost
                    >
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      className="border-2 border-white text-white !hover:bg-white !hover:text-black font-semibold h-10 px-6 rounded-full"
                      ghost
                    >
                      สมัครสมาชิก
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
