import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Spin, message, Button } from 'antd';
import { 
  EnvironmentOutlined, 
  ArrowRightOutlined,
  TrophyOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  LockOutlined,
  UserOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import api from '../../../services/api';
import useAuthStore from '../../stores/authStore';

const GuestVenueBrowser = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState(null);

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

  const sportTypes = [
    {
      key: 'badminton',
      name: 'แบดมินตัน',
      icon: <TrophyOutlined />,
      gradient: 'from-orange-400 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      description: 'สนามแบดมินตัน พื้นไม้คุณภาพ',
      venues: venues.filter(v => v.venue_type === 'badminton')
    },
    {
      key: 'futsal',
      name: 'ฟุตซอล',
      icon: <TrophyOutlined />,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      description: 'สนามฟุตซอล พื้นหญ้าเทียมเกรดพรีเมียม',
      venues: venues.filter(v => v.venue_type === 'futsal')
    },
    {
      key: 'basketball',
      name: 'บาสเกตบอล',
      icon: <TrophyOutlined />,
      gradient: 'from-red-400 to-orange-500',
      bgGradient: 'from-red-50 to-orange-50',
      description: 'สนามบาสเกตบอล มาตรฐานการแข่งขัน',
      venues: venues.filter(v => v.venue_type === 'basketball')
    },
    {
      key: 'other',
      name: 'กีฬาอื่นๆ',
      icon: <TrophyOutlined />,
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: 'เทนนิส วอลเลย์บอล และกีฬาอื่นๆ',
      venues: venues.filter(v => v.venue_type === 'other')
    },
  ];

  const availableSportTypes = sportTypes.filter(sport => sport.venues.length > 0);

  const handleSportClick = (sportKey) => {
    setSelectedSport(sportKey);
  };

  const handleVenueClick = (venue) => {
    if (isAuthenticated) {
      navigate(`/member/venues/${venue.venue_id}`);
    } else {
      navigate(`/guest/venues/${venue.venue_id}`);
    }
  };

  const handleBackToSports = () => {
    setSelectedSport(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!selectedSport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 -mx-4 -mt-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="text-6xl mb-6">
              <ShopOutlined />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              เลือกประเภทกีฬา
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-6">
              เลือกกีฬาที่คุณสนใจเพื่อดูสนามที่เปิดให้บริการ
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Tag className="px-4 py-2 text-base bg-white bg-opacity-20 border-white border-opacity-40">
                <CheckCircleOutlined className="mr-1" />
                {venues.length} สนามทั้งหมด
              </Tag>
              <Tag className="px-4 py-2 text-base bg-white bg-opacity-20 border-white border-opacity-40">
                <CheckCircleOutlined className="mr-1" />
                สนามมาตรฐาน
              </Tag>
              <Tag className="px-4 py-2 text-base bg-white bg-opacity-20 border-white border-opacity-40">
                <CheckCircleOutlined className="mr-1" />
                อุปกรณ์ครบครัน
              </Tag>
            </div>
          </div>
        </div>

        {/* Sport Type Cards */}
        <div className="container mx-auto px-4 pb-12">
          <Row gutter={[24, 24]}>
            {availableSportTypes.map((sport) => (
              <Col xs={24} sm={12} lg={6} key={sport.key}>
                <Card
                  hoverable
                  className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden h-full cursor-pointer"
                  onClick={() => handleSportClick(sport.key)}
                >
                  <div className={`bg-gradient-to-br ${sport.gradient} -mx-6 -mt-6 mb-6 py-10 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white opacity-10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-16 -mt-16 blur-2xl"></div>
                    <div className="text-center relative z-10">
                      <div className="text-7xl mb-3 drop-shadow-lg text-white">
                        {sport.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">
                        {sport.name}
                      </h3>
                    </div>
                  </div>

                  <div className="px-2 pb-2 space-y-4">
                    <p className="text-gray-600 text-center min-h-[48px] flex items-center justify-center">
                      {sport.description}
                    </p>

                    <div className={`bg-gradient-to-r ${sport.bgGradient} p-4 rounded-xl border-2 border-opacity-50`}>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrophyOutlined className="text-2xl" style={{ color: sport.gradient.includes('orange') ? '#f59e0b' : sport.gradient.includes('green') ? '#10b981' : sport.gradient.includes('red') ? '#ef4444' : '#06b6d4' }} />
                          <span className="text-3xl font-bold text-gray-800">
                            {sport.venues.length}
                          </span>
                        </div>
                        <p className="text-gray-600 font-semibold">สนามที่เปิดให้บริการ</p>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      className={`bg-gradient-to-r ${sport.gradient} border-0 font-semibold h-12 rounded-xl shadow-md hover:shadow-lg transition-all`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSportClick(sport.key);
                      }}
                    >
                      ดูสนาม{sport.name}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {availableSportTypes.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">
                <ShopOutlined />
              </div>
              <p className="text-gray-500 text-lg">ยังไม่มีสนามในระบบ</p>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16 -mx-4">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                พร้อมจองสนามแล้วหรือยัง?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                เข้าสู่ระบบเพื่อจองสนามและใช้งานฟีเจอร์เต็มรูปแบบ
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="large"
                  icon={<LockOutlined />}
                  className="bg-white text-green-600 hover:bg-green-50 border-0 font-semibold h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/login')}
                >
                  เข้าสู่ระบบ
                </Button>
                <Button
                  size="large"
                  icon={<UserOutlined />}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold h-12 px-8 rounded-full transition-all"
                  onClick={() => navigate('/register')}
                >
                  สมัครสมาชิก
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedSportData = sportTypes.find(s => s.key === selectedSport);
  const filteredVenues = selectedSportData?.venues || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />

      <div className={`bg-gradient-to-r ${selectedSportData.gradient} text-white py-16 -mx-4 -mt-8 mb-12 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            className="mb-6 bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-40 text-white font-semibold rounded-full"
            onClick={handleBackToSports}
          >
            กลับไปเลือกกีฬา
          </Button>

          <div className="text-center">
            <div className="text-7xl mb-4">{selectedSportData.icon}</div>
            <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
              สนาม{selectedSportData.name}
            </h1>
            <p className="text-xl opacity-95">
              {filteredVenues.length} สนามที่เปิดให้บริการ
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Row gutter={[24, 24]}>
          {filteredVenues.map((venue) => (
            <Col xs={24} md={12} lg={8} key={venue.venue_id}>
              <Card
                hoverable
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer transform hover:-translate-y-2"
                onClick={() => handleVenueClick(venue)}
              >
                {venue.images?.[0] ? (
                  <div className="relative">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${venue.images[0]}`}
                      alt={venue.venue_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white backdrop-blur-sm bg-opacity-90 px-3 py-1 rounded-full shadow-lg">
                        <span className="font-bold text-green-600">{venue.court_count || 0}</span>
                        <span className="text-gray-600 text-sm ml-1">คอร์ท</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-48 bg-gradient-to-br ${selectedSportData.bgGradient} flex items-center justify-center`}>
                    <span className="text-8xl opacity-30">{selectedSportData.icon}</span>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-800 flex-1 line-clamp-1">
                      {venue.venue_name}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start text-gray-600">
                      <EnvironmentOutlined className="mr-2 mt-0.5 text-green-600" />
                      <span className="line-clamp-2 flex-1">{venue.location || 'ไม่ระบุสถานที่'}</span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ArrowRightOutlined />}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold rounded-xl h-12 mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVenueClick(venue);
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredVenues.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{selectedSportData.icon}</div>
            <p className="text-gray-500 text-lg">
              ยังไม่มีสนาม{selectedSportData.name}ในระบบ
            </p>
            <Button
              size="large"
              className="mt-6"
              onClick={handleBackToSports}
            >
              กลับไปเลือกกีฬาอื่น
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestVenueBrowser;