import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Modal, Button, message } from 'antd';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  ArrowRightOutlined,
  UserOutlined 
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import api from '../../../services/api';
import useAuthStore from '../../stores/authStore';

const GuestVenueBrowser = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues?active=true');
      setVenues(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลสนามได้');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = (venue) => {
    if (isAuthenticated) {
      // ถ้า login แล้วให้ไปหน้ารายละเอียด
      navigate(`/venues/${venue.venue_id}`);
    } else {
      // ถ้ายัง แสดง Modal ให้เลือก
      setSelectedVenue(venue);
      setLoginModalVisible(true);
    }
  };

  const handleContinueAsGuest = () => {
    setLoginModalVisible(false);
    navigate(`/guest/venues/${selectedVenue.venue_id}`);
  };

  const handleGoToLogin = () => {
    navigate('/login', { state: { from: `/venues/${selectedVenue.venue_id}` } });
  };

  const venueTypeConfig = {
    badminton: { 
      gradient: 'from-orange-400 to-amber-500', 
      text: 'แบดมินตัน',
      icon: '🏸',
      bgColor: 'from-orange-50 to-amber-50'
    },
    futsal: { 
      gradient: 'from-green-400 to-emerald-500', 
      text: 'ฟุตซอล',
      icon: '⚽',
      bgColor: 'from-green-50 to-emerald-50'
    },
    basketball: { 
      gradient: 'from-red-400 to-orange-500', 
      text: 'บาสเกตบอล',
      icon: '🏀',
      bgColor: 'from-red-50 to-orange-50'
    },
    other: { 
      gradient: 'from-blue-400 to-cyan-500', 
      text: 'อื่นๆ',
      icon: '🎾',
      bgColor: 'from-blue-50 to-cyan-50'
    },
  };

  // จัดกลุ่มสนามตามประเภท
  const groupedVenues = venues.reduce((acc, venue) => {
    const type = venue.venue_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(venue);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16 -mx-4 -mt-8 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            เลือกสนามที่คุณชื่นชอบ
          </h1>
          <p className="text-xl opacity-90">
            เรามีสนามหลากหลายประเภทให้คุณเลือก
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* แสดงแต่ละประเภทสนาม */}
        {Object.keys(groupedVenues).map((type) => {
          const config = venueTypeConfig[type] || venueTypeConfig.other;
          const venuesOfType = groupedVenues[type];

          return (
            <div key={type} className="mb-12">
              {/* Header ของแต่ละประเภท */}
              <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 mb-6 text-white shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{config.icon}</div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{config.text}</h2>
                      <p className="text-white opacity-90">
                        {venuesOfType.length} สนาม
                      </p>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="hidden md:block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
                      <p className="text-sm">💡 เข้าสู่ระบบเพื่อจองได้เลย</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card ของสนาม - แนวนอน */}
              <Row gutter={[24, 24]}>
                {venuesOfType.map((venue) => (
                  <Col xs={24} key={venue.venue_id}>
                    <Card
                      hoverable
                      className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1"
                      onClick={() => handleVenueClick(venue)}
                    >
                      <Row gutter={24}>
                        {/* รูปภาพ */}
                        <Col xs={24} md={8}>
                          {venue.images?.[0] ? (
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${venue.images[0]}`}
                              alt={venue.venue_name}
                              className="w-full h-64 md:h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className={`w-full h-64 md:h-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center rounded-xl`}>
                              <span className="text-8xl opacity-30">{config.icon}</span>
                            </div>
                          )}
                        </Col>

                        {/* ข้อมูล */}
                        <Col xs={24} md={16}>
                          <div className="p-4 md:p-6 h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                    {venue.venue_name}
                                  </h3>
                                  <Tag 
                                    className="px-4 py-1 text-base font-semibold"
                                    color={type === 'badminton' ? 'orange' : type === 'futsal' ? 'green' : type === 'basketball' ? 'red' : 'blue'}
                                  >
                                    {config.icon} {config.text}
                                  </Tag>
                                </div>
                                <div className="bg-green-100 px-4 py-2 rounded-full">
                                  <span className="font-bold text-green-600">{venue.court_count || 0}</span>
                                  <span className="text-gray-600 text-sm ml-1">คอร์ท</span>
                                </div>
                              </div>

                              <div className="space-y-3 mb-4">
                                <div className="flex items-center text-gray-600">
                                  <EnvironmentOutlined className="mr-3 text-green-600 text-lg" />
                                  <span className="text-base">{venue.location || 'ไม่ระบุสถานที่'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <ClockCircleOutlined className="mr-3 text-green-600 text-lg" />
                                  <span className="text-base">
                                    เปิด {venue.opening_time} - {venue.closing_time} น.
                                  </span>
                                </div>
                              </div>

                              {venue.description && (
                                <p className="text-gray-600 line-clamp-2 mb-4">
                                  {venue.description}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                type="primary"
                                size="large"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold rounded-xl flex-1"
                                icon={<ArrowRightOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVenueClick(venue);
                                }}
                              >
                                {isAuthenticated ? 'ดูรายละเอียดและจอง' : 'ดูรายละเอียด'}
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}

        {venues.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏟️</div>
            <p className="text-gray-500 text-lg">ยังไม่มีสนามในระบบ</p>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <Modal
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        centered
        width={500}
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserOutlined className="text-white text-4xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ต้องการจองสนามใช่ไหม?
          </h2>
          <p className="text-gray-600 mb-6">
            เข้าสู่ระบบเพื่อจองสนามและใช้งานฟีเจอร์เต็มรูปแบบ
          </p>

          <div className="space-y-3">
            <Button
              type="primary"
              size="large"
              block
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12 rounded-xl"
              onClick={handleGoToLogin}
            >
              🔐 เข้าสู่ระบบ / สมัครสมาชิก
            </Button>
            
            <Button
              size="large"
              block
              className="h-12 rounded-xl font-semibold"
              onClick={handleContinueAsGuest}
            >
              👀 ดูข้อมูลสนามต่อ (ไม่สามารถจองได้)
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            💡 สมาชิกสามารถจองสนาม ดูประวัติการจอง และรับสิทธิพิเศษ
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default GuestVenueBrowser;