import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Rate, Button, message } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const PublicDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

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

  const handleBooking = (venueId) => {
    if (!isAuthenticated) {
      message.warning('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      navigate('/login');
      return;
    }
    navigate(`/venues/${venueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">สนามกีฬาทั้งหมด</h1>
        
        <Row gutter={[16, 16]}>
          {venues.map((venue) => (
            <Col xs={24} sm={12} lg={8} key={venue.venue_id}>
              <Card
                hoverable
                cover={
                  venue.images?.[0] ? (
                    <img
                      alt={venue.venue_name}
                      src={`${import.meta.env.VITE_BASE_URL}${venue.images[0]}`}
                      className="h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-6xl">🏟️</span>
                    </div>
                  )
                }
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{venue.venue_name}</h3>
                  <Tag color="blue">{venue.venue_type}</Tag>
                  
                  {venue.avg_rating && (
                    <div>
                      <Rate disabled value={parseFloat(venue.avg_rating)} />
                      <span className="ml-2 text-gray-600">
                        ({venue.review_count} รีวิว)
                      </span>
                    </div>
                  )}
                  
                  <p className="text-gray-600">
                    <EnvironmentOutlined /> {venue.location || 'ไม่ระบุที่อยู่'}
                  </p>
                  
                  <p className="text-gray-600">
                    <ClockCircleOutlined /> {venue.opening_time} - {venue.closing_time}
                  </p>
                  
                  <p className="text-gray-600">
                    จำนวนคอร์ท: {venue.court_count} คอร์ท
                  </p>
                  
                  <Button 
                    type="primary" 
                    block
                    onClick={() => handleBooking(venue.venue_id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ดูรายละเอียด
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {venues.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">ยังไม่มีสนามในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDashboard;