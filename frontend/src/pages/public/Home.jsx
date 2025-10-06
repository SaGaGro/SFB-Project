import { Link } from 'react-router-dom';
import { Button, Card, Row, Col } from 'antd';
import { 
  ThunderboltOutlined, 
  CreditCardOutlined, 
  TrophyOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';

const Home = () => {
  const features = [
    {
      icon: <EnvironmentOutlined className="text-5xl text-green-600" />,
      title: 'หลายสาขา',
      description: 'เรามีสนามกีฬาหลายสาขาให้คุณเลือกตามความสะดวก',
      gradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: <ThunderboltOutlined className="text-5xl text-green-600" />,
      title: 'จองง่าย รวดเร็ว',
      description: 'จองคอร์ทได้ภายในไม่กี่นาที ผ่านระบบออนไลน์',
      gradient: 'from-emerald-50 to-teal-50'
    },
    {
      icon: <CreditCardOutlined className="text-5xl text-green-600" />,
      title: 'ชำระเงินสะดวก',
      description: 'รองรับ QR Code PromptPay และช่องทางอื่นๆ',
      gradient: 'from-teal-50 to-cyan-50'
    },
    {
      icon: <TrophyOutlined className="text-5xl text-green-600" />,
      title: 'สนามมาตรฐาน',
      description: 'สนามคุณภาพ พร้อมอุปกรณ์กีฬาครบครัน',
      gradient: 'from-cyan-50 to-blue-50'
    },
    {
      icon: <SafetyOutlined className="text-5xl text-green-600" />,
      title: 'ปลอดภัย มั่นใจ',
      description: 'ระบบจองปลอดภัย มีการยืนยันทุกครั้ง',
      gradient: 'from-blue-50 to-indigo-50'
    },
    {
      icon: <ClockCircleOutlined className="text-5xl text-green-600" />,
      title: 'เปิดบริการทุกวัน',
      description: 'จองได้ตลอด 24 ชั่วโมง ผ่านเว็บไซต์',
      gradient: 'from-indigo-50 to-purple-50'
    },
  ];

  const sportTypes = [
    {
      icon: '🏸',
      name: 'แบดมินตัน',
      description: 'สนามมาตรฐาน พื้นไม้คุณภาพ',
      color: 'from-orange-400 to-amber-500'
    },
    {
      icon: '⚽',
      name: 'ฟุตซอล',
      description: 'พื้นหญ้าเทียม เกรดพรีเมียม',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: '🏀',
      name: 'บาสเกตบอล',
      description: 'สนามกลางแจ้ง และในร่ม',
      color: 'from-red-400 to-orange-500'
    },
    {
      icon: '🎾',
      name: 'กีฬาอื่นๆ',
      description: 'เทนนิส วอลเลย์บอล',
      color: 'from-blue-400 to-cyan-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-10 -ml-48 -mb-48 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-in">
              <span className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold mb-4 border border-white border-opacity-30">
                🏆 ระบบจองคอร์ทออนไลน์ที่ดีที่สุด
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
              จองคอร์ทกีฬา
            </h1>
            <p className="text-2xl md:text-3xl mb-4 opacity-95 font-light">
              สนามกีฬาคุณภาพ หลายสาขาทั่วกรุงเทพ
            </p>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              🏸 แบดมินตัน | ⚽ ฟุตซอล | 🏀 บาสเกตบอล | 🎾 และอื่นๆ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/venues">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-white text-green-600 hover:bg-green-50 border-0 font-semibold h-14 px-10 rounded-full shadow-2xl hover:shadow-green-200 hover:scale-105 transition-all text-lg"
                >
                  🔍 ดูสนามทั้งหมด
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="large" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold h-14 px-10 rounded-full hover:scale-105 transition-all text-lg"
                >
                  ✨ สมัครสมาชิก
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
              <div className="text-center">
                <p className="text-4xl font-bold mb-1">10+</p>
                <p className="text-sm opacity-90">สาขาทั่วกรุงเทพ</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold mb-1">50+</p>
                <p className="text-sm opacity-90">คอร์ทให้เลือก</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold mb-1">1000+</p>
                <p className="text-sm opacity-90">ลูกค้าพึงพอใจ</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" 
                  fill="url(#gradient)" fillOpacity="0.3"/>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" 
                  fill="#f0fdf4"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
                <stop offset="0%" stopColor="#f0fdf4"/>
                <stop offset="100%" stopColor="#ecfdf5"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Sport Types Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ประเภทกีฬาที่เปิดให้บริการ
          </h2>
          <p className="text-gray-600 text-lg">
            เลือกกีฬาที่คุณชื่นชอบ
          </p>
        </div>

        <Row gutter={[24, 24]} className="mb-12">
          {sportTypes.map((sport, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                className="text-center h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => window.location.href = '/venues'}
              >
                <div className={`bg-gradient-to-br ${sport.color} -mx-6 -mt-6 mb-6 py-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <div className="text-7xl mb-2 relative z-10 drop-shadow-lg">{sport.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {sport.name}
                </h3>
                <p className="text-gray-600">{sport.description}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center">
          <Link to="/venues">
            <Button 
              size="large" 
              type="primary" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 h-14 px-10 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
            >
              📅 ดูสนามทั้งหมด
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ทำไมต้องจองกับเรา
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              สนามกีฬาของเรามีจุดเด่นมากมายที่ทำให้คุณเลือกใช้บริการ
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  className={`text-center h-full hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-2xl overflow-hidden transform hover:-translate-y-2 bg-gradient-to-br ${feature.gradient}`}
                  bodyStyle={{ padding: '2.5rem' }}
                >
                  <div className="mb-6 transform hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ลูกค้าของเราพูดถึงเรา
          </h2>
          <p className="text-gray-600 text-lg">
            ความพึงพอใจของคุณคือความสำเร็จของเรา
          </p>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-xl rounded-2xl h-full bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                  K
                </div>
                <div>
                  <p className="font-bold text-gray-800">คุณกิตติ</p>
                  <p className="text-sm text-gray-600">นักแบดมินตัน</p>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic">
                "สนามสะอาด อุปกรณ์ครบครัน ระบบจองใช้ง่ายมาก แนะนำเลยครับ"
              </p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-xl rounded-2xl h-full bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                  S
                </div>
                <div>
                  <p className="font-bold text-gray-800">คุณสมชาย</p>
                  <p className="text-sm text-gray-600">นักฟุตซอล</p>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic">
                "สนามหญ้าเทียมคุณภาพดี เล่นสนุก บรรยากาศดี ราคาไม่แพง"
              </p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-xl rounded-2xl h-full bg-gradient-to-br from-teal-50 to-cyan-50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                  N
                </div>
                <div>
                  <p className="font-bold text-gray-800">คุณนภา</p>
                  <p className="text-sm text-gray-600">นักบาสเกตบอล</p>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic">
                "จองง่าย ชำระเงินสะดวก พนักงานบริการดีมาก ประทับใจ"
              </p>
            </Card>
          </Col>
        </Row>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
              พร้อมจองแล้วหรือยัง
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              สมัครสมาชิกวันนี้ จองคอร์ทได้ทันที
            </p>
            <p className="text-lg mb-10 opacity-90">
              ✓ ไม่มีค่าสมัคร  ✓ จองง่ายในไม่กี่คลิก  ✓ ยกเลิกได้ฟรี
            </p>
            <Link to="/register">
              <Button 
                size="large" 
                className="bg-white text-green-600 hover:bg-green-50 border-0 font-semibold h-14 px-10 rounded-full shadow-2xl hover:scale-105 transition-all text-lg"
              >
                🚀 สมัครสมาชิกเลย
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
                  <span className="text-3xl">🏟️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">SPORT BOOKING</h3>
                  <p className="text-sm text-gray-400">ระบบจองคอร์ทกีฬา</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                ระบบจองคอร์ทกีฬาออนไลน์ที่ดีที่สุด ให้บริการสนามกีฬาคุณภาพ หลายสาขาทั่วกรุงเทพ
              </p>
            </Col>
            <Col xs={24} md={8}>
              <h4 className="text-lg font-bold text-white mb-4">เมนูลัด</h4>
              <ul className="space-y-2">
                <li><Link to="/venues" className="text-gray-400 hover:text-green-400 transition-colors">ดูสนามทั้งหมด</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors">สมัครสมาชิก</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors">เข้าสู่ระบบ</Link></li>
              </ul>
            </Col>
            <Col xs={24} md={8}>
              <h4 className="text-lg font-bold text-white mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@sportbooking.com</li>
                <li>📱 02-XXX-XXXX</li>
                <li>📍 กรุงเทพมหานคร ประเทศไทย</li>
              </ul>
            </Col>
          </Row>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Sport Booking System - ระบบจองคอร์ทกีฬาออนไลน์
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;