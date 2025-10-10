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
  ArrowLeftOutlined,
  ClockCircleOutlined,
  StarFilled,
  ThunderboltOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import api from '../../../services/api';
import useAuthStore from '../../stores/authStore';
import Logo from '../../assets/logo/logo2.svg';

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

  // Image mapping based on venue type
  const venueImages = {
    futsal: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aae?w=800&q=80',
    football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    other: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
  };

  const sportTypes = [
    {
      key: 'badminton',
      name: 'แบดมินตัน',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-amber-50',
      cardGradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      darkColor: '#f59e0b',
      description: 'สนามแบดมินตัน พื้นไม้คุณภาพมาตรฐาน',
      backgroundImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
      venues: venues.filter(v => v.venue_type === 'badminton')
    },
    {
      key: 'futsal',
      name: 'ฟุตซอล',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-amber-50',
      cardGradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      darkColor: '#f59e0b',
      description: 'สนามฟุตซอล พื้นหญ้าเทียมเกรดพรีเมียม',
      backgroundImage: 'data:image/jpeg;base64,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',
      venues: venues.filter(v => v.venue_type === 'futsal')
    },
    {
      key: 'basketball',
      name: 'บาสเกตบอล',
      icon: '🏀',
      gradient: 'from-red-500 via-orange-500 to-amber-500',
      bgGradient: 'from-red-50 to-orange-50',
      cardGradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
      darkColor: '#ef4444',
      description: 'สนามบาสเกตบอล มาตรฐานการแข่งขัน',
      backgroundImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      venues: venues.filter(v => v.venue_type === 'basketball')
    },
    {
      key: 'other',
      name: 'กีฬาอื่นๆ',
      icon: '🎾',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      bgGradient: 'from-amber-50 to-orange-50',
      cardGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      darkColor: '#f59e0b',
      description: 'เทนนิส วอลเลย์บอล และกีฬาอื่นๆ',
      backgroundImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!selectedSport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 -mx-4 -mt-8 px-4 py-24 mb-16">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl animate-pulse"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center  bg-white bg-opacity-30 backdrop-blur-md rounded-full mb-6 animate-bounce">
                <img 
                  src={Logo}
                  alt="Trophy" 
                  className="w-30 h-30 drop-shadow-2xl"
                />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                เลือกประเภทกีฬา
              </h1>
              <p className="text-2xl md:text-3xl text-white opacity-95 mb-8 font-light">
                เลือกกีฬาที่คุณสนใจเพื่อดูสนามที่เปิดให้บริการ
              </p>
              
              {/* Stats */}
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 px-6 py-3 rounded-full">
                  <span className="text-black text-lg">
                    <TrophyOutlined className="mr-2" />
                    <span className="font-bold text-2xl">{venues.length}</span> สนามทั้งหมด
                  </span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 px-6 py-3 rounded-full">
                  <span className="text-black text-lg">
                    <CrownOutlined className="mr-2" />
                    สนามมาตรฐาน
                  </span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 px-6 py-3 rounded-full">
                  <span className="text-black text-lg">
                    <ThunderboltOutlined className="mr-2" />
                    อุปกรณ์ครบครัน
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sport Type Cards */}
        <div className="container mx-auto px-4 pb-16">
          <Row gutter={[32, 32]}>
            {availableSportTypes.map((sport, index) => (
              <Col xs={24} sm={12} lg={6} key={sport.key}>
                <Card
                  hoverable
                  className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 rounded-3xl overflow-hidden h-full cursor-pointer group"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                  onClick={() => handleSportClick(sport.key)}
                >
                  {/* Header with background image */}
                  <div className="relative overflow-hidden -mx-6 -mt-6 mb-6 h-64">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${sport.backgroundImage})` }}
                    ></div>
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-80`}></div>
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full opacity-10 -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 -ml-16 -mb-16 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="text-center relative z-10 h-full flex flex-col items-center justify-center">
                      <div className="text-8xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        {sport.icon}
                      </div>
                    </div>
                    
                    {/* Sport name at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                        {sport.name}
                      </h3>
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-5">
                    <p className="text-gray-600 text-center min-h-[60px] flex items-center justify-center text-base leading-relaxed">
                      {sport.description}
                    </p>

                    {/* Venue Count */}
                    <div className={`bg-gradient-to-br ${sport.bgGradient} p-6 rounded-2xl border-2 border-opacity-50 shadow-inner relative overflow-hidden group-hover:shadow-lg transition-shadow duration-300`}>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="text-center relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="text-5xl font-bold text-gray-800">
                            {sport.venues.length}
                          </span>
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">สนามที่เปิดให้บริการ</p>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />}
                      className="border-0 font-bold h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                      style={{
                        background: sport.cardGradient,
                      }}
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
              <div className="text-8xl mb-6 opacity-30">
                <ShopOutlined />
              </div>
              <p className="text-gray-500 text-2xl">ยังไม่มีสนามในระบบ</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-20 -mx-4 mb-0">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
            
            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="mb-8">
                <LockOutlined className="text-7xl mb-4 opacity-90" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                พร้อมจองสนามแล้วหรือยัง?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                เข้าสู่ระบบเพื่อจองสนามและใช้งานฟีเจอร์เต็มรูปแบบ
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <Button
                  size="large"
                  icon={<LockOutlined />}
                  className="bg-white text-orange-600 hover:bg-orange-50 border-0 font-bold h-16 px-12 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg transform hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  เข้าสู่ระบบ
                </Button>
                <Button
                  size="large"
                  icon={<UserOutlined />}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold h-16 px-12 rounded-full transition-all duration-300 text-lg transform hover:scale-105"
                  onClick={() => navigate('/register')}
                >
                  สมัครสมาชิก
                </Button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  const selectedSportData = sportTypes.find(s => s.key === selectedSport);
  const filteredVenues = selectedSportData?.venues || [];
  const imageUrl = venueImages[selectedSport] || venueImages.other;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />

      {/* Sport Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${selectedSportData.gradient} text-white py-20 -mx-4 -mt-8 mb-12`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            className="mb-8 bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-40 text-white font-bold rounded-full h-12 px-6 backdrop-blur-md shadow-lg"
            onClick={handleBackToSports}
          >
            กลับไปเลือกกีฬา
          </Button>

          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">{selectedSportData.icon}</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
              สนาม{selectedSportData.name}
            </h1>
            <p className="text-2xl opacity-95">
              พบ {filteredVenues.length} สนามที่เปิดให้บริการ
            </p>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="container mx-auto px-4 pb-16">
        <Row gutter={[32, 32]}>
          {filteredVenues.map((venue, index) => (
            <Col xs={24} md={12} lg={8} key={venue.venue_id}>
              <Card
                hoverable
                className="border-0 shadow-xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer transform hover:-translate-y-3 hover:scale-[1.02] group"
                bodyStyle={{ padding: 0 }}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleVenueClick(venue)}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-64">
                  {venue.images?.[0] ? (
                    <div className="relative h-full">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${venue.images[0]}`}
                        alt={venue.venue_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative h-full">
                      <img
                        alt={venue.venue_name}
                        src={imageUrl}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <div 
                      className="px-5 py-2.5 rounded-full text-white font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md transform group-hover:scale-110 transition-transform duration-300"
                      style={{ background: selectedSportData.cardGradient }}
                    >
                      <span className="text-2xl">{selectedSportData.icon}</span>
                      <span className="text-base">{selectedSportData.name}</span>
                    </div>
                  </div>

                  {/* Court Count Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white backdrop-blur-md bg-opacity-95 px-5 py-2.5 rounded-full shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <span className="font-bold text-orange-600 text-lg">{venue.court_count || 0}</span>
                      <span className="text-gray-600 text-sm ml-1.5">คอร์ท</span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {venue.avg_rating && (
                    <div className="absolute bottom-20 left-4">
                      <div className="bg-yellow-400 backdrop-blur-md bg-opacity-95 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform group-hover:scale-110 transition-transform duration-300">
                        <StarFilled className="text-white text-base" />
                        <span className="font-bold text-white text-lg">{venue.avg_rating}</span>
                        <span className="text-white text-sm opacity-90">({venue.review_count})</span>
                      </div>
                    </div>
                  )}

                  {/* Venue Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-2xl font-bold drop-shadow-2xl mb-2">
                      {venue.venue_name}
                    </h3>
                    <div className="flex items-center text-white/95 text-base">
                      <EnvironmentOutlined className="mr-2 text-lg" />
                      <span className="drop-shadow-lg line-clamp-1">{venue.location || 'ไม่ระบุสถานที่'}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4 bg-white">
                  <div className="flex items-center text-gray-600 text-base">
                    <ClockCircleOutlined className="mr-2 text-orange-600 text-lg" />
                    <span className="font-medium">เปิด {venue.opening_time || '06:00'} - {venue.closing_time || '22:00'} น.</span>
                  </div>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Tag color="orange" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
                      ✓ มาตรฐาน
                    </Tag>
                    <Tag color="gold" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
                      ✓ ที่จอดรถ
                    </Tag>
                    <Tag color="volcano" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
                      ✓ ห้องน้ำ
                    </Tag>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      className="border-0 font-bold rounded-2xl h-14 shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                      style={{
                        background: selectedSportData.cardGradient,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVenueClick(venue);
                      }}
                    >
                      ดูรายละเอียดและจอง
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredVenues.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-30">{selectedSportData.icon}</div>
            <p className="text-gray-500 text-2xl mb-6">
              ยังไม่มีสนาม{selectedSportData.name}ในระบบ
            </p>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              className="h-12 px-8 rounded-full font-bold"
              onClick={handleBackToSports}
            >
              กลับไปเลือกกีฬาอื่น
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GuestVenueBrowser;