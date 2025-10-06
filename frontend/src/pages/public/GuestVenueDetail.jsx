import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Tag, 
  Button, 
  Carousel, 
  Descriptions,
  message,
  Spin,
  Empty,
  Alert,
  Modal
} from 'antd';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import api from '../../../services/api';

const GuestVenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  useEffect(() => {
    fetchVenueDetail();
  }, [id]);

  const fetchVenueDetail = async () => {
    try {
      const response = await api.get(`/venues/${id}`);
      setVenue(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลสนามได้');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = () => {
    setLoginModalVisible(true);
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

  if (!venue) return null;

  const venueTypeConfig = {
    badminton: { gradient: 'from-orange-500 to-amber-500', text: 'แบดมินตัน', icon: '🏸' },
    futsal: { gradient: 'from-green-500 to-emerald-500', text: 'ฟุตซอล', icon: '⚽' },
    basketball: { gradient: 'from-red-500 to-orange-500', text: 'บาสเกตบอล', icon: '🏀' },
    other: { gradient: 'from-cyan-500 to-blue-500', text: 'อื่นๆ', icon: '🎾' },
  };

  const config = venueTypeConfig[venue.venue_type] || venueTypeConfig.other;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/venues')}
          size="large"
          className="mb-6 shadow-md hover:shadow-lg transition-shadow"
        >
          กลับไปหน้ารายการสนาม
        </Button>

        {/* Alert สำหรับ Guest */}
        <Alert
          message="โหมดดูข้อมูล (Guest Mode)"
          description={
            <div>
              <p className="mb-2">คุณกำลังดูข้อมูลในโหมด Guest ไม่สามารถจองสนามได้</p>
              <Button 
                type="primary" 
                size="small"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/login')}
              >
                เข้าสู่ระบบเพื่อจอง
              </Button>
            </div>
          }
          type="info"
          icon={<UserOutlined />}
          showIcon
          className="mb-6 rounded-xl"
        />

        <Card className="mb-6 shadow-xl border-0 rounded-2xl overflow-hidden">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              {venue.images && venue.images.length > 0 ? (
                <Carousel autoplay className="rounded-2xl overflow-hidden shadow-lg">
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
                    <div className={`bg-gradient-to-r ${config.gradient} px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 shadow-lg`}>
                      <span className="text-xl">{config.icon}</span>
                      <span>{config.text}</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {venue.venue_name}
                  </h1>
                </div>

                <Descriptions column={1} bordered>
                  <Descriptions.Item label={<><EnvironmentOutlined className="text-green-600" /> สถานที่</>}>
                    {venue.location || 'ไม่ระบุ'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><ClockCircleOutlined className="text-green-600" /> เวลาเปิด-ปิด</>}>
                    <span className="font-semibold text-green-600">
                      {venue.opening_time} - {venue.closing_time} น.
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label={<><AppstoreOutlined className="text-green-600" /> จำนวนคอร์ท</>}>
                    <span className="font-bold text-2xl text-green-600">
                      {venue.courts?.length || 0} คอร์ท
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                {venue.description && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">รายละเอียด</h3>
                    <p className="text-gray-700 leading-relaxed">{venue.description}</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Courts Section */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">คอร์ทที่เปิดให้บริการ</span>
              <Tag color="orange" className="px-4 py-2 text-base">
                <LockOutlined /> ต้องเข้าสู่ระบบเพื่อจอง
              </Tag>
            </div>
          }
          className="shadow-xl border-0 rounded-2xl"
        >
          <Row gutter={[24, 24]}>
            {venue.courts && venue.courts.length > 0 ? (
              venue.courts.map((court) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={court.court_id}>
                  <Card 
                    className="border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all rounded-xl relative overflow-hidden"
                  >
                    {/* Overlay สำหรับ Guest */}
                    <div className="absolute top-2 right-2 z-10">
                      <Tag color="orange" className="shadow-md">
                        <LockOutlined /> ต้อง Login
                      </Tag>
                    </div>

                    <div className="opacity-70">
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        {court.court_name}
                      </h4>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100 mb-3">
                        <p className="text-sm text-gray-600 mb-1">ราคา</p>
                        <p className="text-2xl font-bold text-green-600">
                          {court.hourly_rate} <span className="text-base">บาท/ชม.</span>
                        </p>
                      </div>
                      
                      {court.capacity && (
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-gray-600">จำนวนคน</span>
                          <span className="font-semibold text-gray-800">{court.capacity} คน</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      className="bg-orange-500 hover:bg-orange-600 border-0 font-semibold rounded-lg h-12"
                      icon={<LockOutlined />}
                      onClick={handleBookingClick}
                    >
                      เข้าสู่ระบบเพื่อจอง
                    </Button>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="ยังไม่มีคอร์ทในสนามนี้" />
              </Col>
            )}
          </Row>
        </Card>
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
            <LockOutlined className="text-white text-4xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ต้องการจองสนามนี้?
          </h2>
          <p className="text-gray-600 mb-6">
            กรุณาเข้าสู่ระบบเพื่อทำการจองสนาม
          </p>

          <div className="space-y-3">
            <Button
              type="primary"
              size="large"
              block
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold h-12 rounded-xl"
              onClick={() => navigate('/login', { state: { from: `/venues/${id}` } })}
            >
              เข้าสู่ระบบ
            </Button>
            
            <Button
              size="large"
              block
              className="h-12 rounded-xl font-semibold"
              onClick={() => navigate('/register')}
            >
              สมัครสมาชิกใหม่
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GuestVenueDetail;