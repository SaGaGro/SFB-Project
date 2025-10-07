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
      icon: ' ',
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
      icon: '',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-emerald-50',
      cardGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      darkColor: '#10b981',
      description: 'สนามฟุตซอล พื้นหญ้าเทียมเกรดพรีเมียม',
      backgroundImage: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aae?w=800&q=80',
      venues: venues.filter(v => v.venue_type === 'futsal')
    },
    {
      key: 'basketball',
      name: 'บาสเกตบอล',
      icon: '🏀',
      gradient: 'from-red-500 via-orange-500 to-amber-500',
      bgGradient: 'from-red-50 to-orange-50',
      cardGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      darkColor: '#ef4444',
      description: 'สนามบาสเกตบอล มาตรฐานการแข่งขัน',
      backgroundImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      venues: venues.filter(v => v.venue_type === 'basketball')
    },
    {
      key: 'other',
      name: 'กีฬาอื่นๆ',
      icon: '🎾',
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      cardGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      darkColor: '#06b6d4',
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
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 -mx-4 -mt-8 px-4 py-24 mb-16">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl animate-pulse"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-block p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-3xl mb-6 animate-bounce">
                <TrophyOutlined className="text-7xl text-white drop-shadow-2xl" />
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
                  <span className="text-white text-lg">
                    <TrophyOutlined className="mr-2" />
                    <span className="font-bold text-2xl">{venues.length}</span> สนามทั้งหมด
                  </span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 px-6 py-3 rounded-full">
                  <span className="text-white text-lg">
                    <CrownOutlined className="mr-2" />
                    สนามมาตรฐาน
                  </span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 px-6 py-3 rounded-full">
                  <span className="text-white text-lg">
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
                          <TrophyOutlined 
                            className="text-4xl transition-transform duration-300 group-hover:scale-110" 
                            style={{ color: sport.darkColor }} 
                          />
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
          <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 -mx-4 mb-0">
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
                  className="bg-white text-green-600 hover:bg-green-50 border-0 font-bold h-16 px-12 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg transform hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  เข้าสู่ระบบ
                </Button>
                <Button
                  size="large"
                  icon={<UserOutlined />}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold h-16 px-12 rounded-full transition-all duration-300 text-lg transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
                      <span className="font-bold text-green-600 text-lg">{venue.court_count || 0}</span>
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
                    <ClockCircleOutlined className="mr-2 text-green-600 text-lg" />
                    <span className="font-medium">เปิด {venue.opening_time || '06:00'} - {venue.closing_time || '22:00'} น.</span>
                  </div>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Tag color="green" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
                      ✓ มาตรฐาน
                    </Tag>
                    <Tag color="blue" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
                      ✓ ที่จอดรถ
                    </Tag>
                    <Tag color="orange" className="border-0 rounded-full px-4 py-1.5 text-sm font-semibold">
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