import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Tag,
  Rate,
  Button,
  Carousel,
  Descriptions,
  Divider,
  message,
  Spin,
  Empty,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
  MailOutlined,
  AppstoreOutlined,
  StarFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import api from "../../../services/api";

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueDetail();
  }, [id]);

  const fetchVenueDetail = async () => {
    try {
      const response = await api.get(`/venues/${id}`);
      setVenue(response.data);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลสนามได้");
      navigate("/member/venues");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!venue) return null;

  const venueTypeConfig = {
    badminton: {
      gradient: "from-orange-500 to-amber-500",
      text: "แบดมินตัน",
      icon: "🏸",
    },
    futsal: {
      gradient: "from-green-500 to-emerald-500",
      text: "ฟุตซอล",
      icon: "⚽",
    },
    basketball: {
      gradient: "from-red-500 to-orange-500",
      text: "บาสเกตบอล",
      icon: "🏀",
    },
    other: {
      gradient: "from-cyan-500 to-blue-500",
      text: "อื่นๆ",
      icon: "🎾",
    },
  };

  const config = venueTypeConfig[venue.venue_type] || venueTypeConfig.other;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 -mx-4 -mt-8 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* ปุ่มกลับ */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/member/venues")}
          size="large"
          className="mb-6 shadow-md hover:shadow-lg transition-shadow"
        >
          กลับไปหน้ารายการสนาม
        </Button>

        {/* Header Card */}
        <Card className="mb-6 shadow-xl border-0 rounded-2xl overflow-hidden">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              {venue.images && venue.images.length > 0 ? (
                <Carousel
                  autoplay
                  className="rounded-2xl overflow-hidden shadow-lg"
                >
                  {venue.images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${image}`}
                        alt={`${venue.venue_name} ${index + 1}`}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <AppstoreOutlined className="text-9xl text-green-300" />
                </div>
              )}
            </Col>

            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`bg-gradient-to-r ${config.gradient} px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 shadow-lg`}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span>{config.text}</span>
                    </div>
                    <Tag color="green" className="px-4 py-1">
                      <CheckCircleFilled /> เปิดให้บริการ
                    </Tag>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {venue.venue_name}
                  </h1>
                </div>

                {venue.avg_rating && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <StarFilled className="text-yellow-500 text-2xl" />
                      <span className="text-3xl font-bold text-gray-800">
                        {venue.avg_rating}
                      </span>
                    </div>
                    <div>
                      <Rate
                        disabled
                        value={parseFloat(venue.avg_rating)}
                        className="text-lg"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        จาก {venue.review_count} รีวิว
                      </p>
                    </div>
                  </div>
                )}

                <Descriptions
                  column={1}
                  bordered
                  className="custom-descriptions"
                >
                  <Descriptions.Item
                    label={
                      <span className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-green-600" />
                        <span className="font-semibold">สถานที่</span>
                      </span>
                    }
                  >
                    {venue.location || "ไม่ระบุ"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-green-600" />
                        <span className="font-semibold">เวลาเปิด-ปิด</span>
                      </span>
                    }
                  >
                    <span className="font-semibold text-green-600">
                      {venue.opening_time} - {venue.closing_time} น.
                    </span>
                  </Descriptions.Item>
                  {venue.contact_phone && (
                    <Descriptions.Item
                      label={
                        <span className="flex items-center gap-2">
                          <PhoneOutlined className="text-green-600" />
                          <span className="font-semibold">เบอร์ติดต่อ</span>
                        </span>
                      }
                    >
                      {venue.contact_phone}
                    </Descriptions.Item>
                  )}
                  {venue.contact_email && (
                    <Descriptions.Item
                      label={
                        <span className="flex items-center gap-2">
                          <MailOutlined className="text-green-600" />
                          <span className="font-semibold">อีเมล</span>
                        </span>
                      }
                    >
                      {venue.contact_email}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item
                    label={
                      <span className="flex items-center gap-2">
                        <AppstoreOutlined className="text-green-600" />
                        <span className="font-semibold">จำนวนคอร์ท</span>
                      </span>
                    }
                  >
                    <span className="font-bold text-2xl text-green-600">
                      {venue.courts?.length || 0} คอร์ท
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                {venue.description && (
                  <>
                    <Divider />
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded"></span>
                        รายละเอียด
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {venue.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Courts Section */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded"></span>
                คอร์ทที่เปิดให้บริการ
              </span>
              <Tag color="green" className="px-4 py-2 text-base">
                {venue.courts?.length || 0} คอร์ท
              </Tag>
            </div>
          }
          className="shadow-xl border-0 rounded-2xl overflow-hidden"
        >
          <Row gutter={[24, 24]}>
            {venue.courts && venue.courts.length > 0 ? (
              venue.courts.map((court) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={court.court_id}>
                  <Card
                    className="border-2 border-green-100 hover:border-green-400 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden transform hover:-translate-y-1"
                    onClick={() =>
                      navigate(
                        `/member/booking/${venue.venue_id}/${court.court_id}`
                      )
                    }
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-1">
                          {court.court_name}
                        </h4>
                        <Tag
                          color={court.status === "available" ? "green" : "red"}
                          className="px-3 py-1"
                        >
                          {court.status === "available"
                            ? "✓ พร้อมใช้งาน"
                            : "✗ ไม่พร้อมใช้งาน"}
                        </Tag>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                        <p className="text-sm text-gray-600 mb-1">ราคา</p>
                        <p className="text-2xl font-bold text-green-600">
                          {court.hourly_rate}{" "}
                          <span className="text-base">บาท/ชม.</span>
                        </p>
                      </div>

                      {court.capacity && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">จำนวนคน</span>
                          <span className="font-semibold text-gray-800">
                            {court.capacity} คน
                          </span>
                        </div>
                      )}

                      <Button
                        type="primary"
                        block
                        size="large"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold rounded-lg h-12 mt-4 shadow-md hover:shadow-lg transition-all"
                        disabled={court.status !== "available"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/member/booking/${venue.venue_id}/${court.court_id}`
                          );
                        }}
                      >
                        {court.status === "available"
                          ? "📅 จองคอร์ทนี้"
                          : "ไม่พร้อมใช้งาน"}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="ยังไม่มีคอร์ทในสนามนี้" className="py-12" />
              </Col>
            )}
          </Row>
        </Card>

        {/* Equipment Section */}
        {venue.equipment && venue.equipment.length > 0 && (
          <Card
            title={
              <span className="text-2xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded"></span>
                อุปกรณ์ให้เช่า
              </span>
            }
            className="mt-6 shadow-xl border-0 rounded-2xl overflow-hidden"
          >
            <Row gutter={[16, 16]}>
              {venue.equipment.map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.equipment_id}>
                  <Card className="text-center border border-green-100 hover:border-green-400 hover:shadow-lg transition-all rounded-xl">
                    <div className="text-4xl mb-3">🏸</div>
                    <h4 className="font-bold text-lg mb-2">
                      {item.equipment_name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      คงเหลือ:{" "}
                      <span className="font-semibold text-green-600">
                        {item.stock}
                      </span>{" "}
                      ชิ้น
                    </p>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg border border-green-100">
                      <p className="text-green-600 font-bold text-lg">
                        {item.rental_price} บาท/ชิ้น
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-descriptions .ant-descriptions-item-label {
          background-color: #f0fdf4;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default VenueDetail;
