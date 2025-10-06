import { Card, Tag, Rate, Button } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, AppstoreOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const venueTypeConfig = {
    badminton: { 
      color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', 
      text: 'แบดมินตัน',
      icon: '🏸',
      bgColor: 'from-orange-50 to-amber-50'
    },
    futsal: { 
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      text: 'ฟุตซอล',
      icon: '⚽',
      bgColor: 'from-green-50 to-emerald-50'
    },
    basketball: { 
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
      text: 'บาสเกตบอล',
      icon: '🏀',
      bgColor: 'from-red-50 to-orange-50'
    },
    other: { 
      color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
      text: 'อื่นๆ',
      icon: '🎾',
      bgColor: 'from-cyan-50 to-blue-50'
    },
  };

  const config = venueTypeConfig[venue.venue_type] || venueTypeConfig.other;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    console.log('Navigating to:', `/member/venues/${venue.venue_id}`);
    navigate(`/member/venues/${venue.venue_id}`);
  };

  return (
    <Card
      hoverable
      className="rounded-2xl overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
      bodyStyle={{ padding: 0 }}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {venue.images?.[0] ? (
          <div className="relative">
            <img
              alt={venue.venue_name}
              src={`${import.meta.env.VITE_BASE_URL}${venue.images[0]}`}
              className="w-full h-52 object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className={`w-full h-52 bg-gradient-to-br ${config.bgColor} flex items-center justify-center`}>
            <div className="text-8xl opacity-30">{config.icon}</div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <div 
            className="px-4 py-2 rounded-full text-white font-semibold shadow-lg flex items-center gap-2"
            style={{ background: config.color }}
          >
            <span className="text-xl">{config.icon}</span>
            <span>{config.text}</span>
          </div>
        </div>

        {/* Court Count Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white backdrop-blur-sm bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
            <span className="font-bold text-green-600">{venue.court_count || 0}</span>
            <span className="text-gray-600 text-sm ml-1">คอร์ท</span>
          </div>
        </div>

        {/* Rating Badge (if available) */}
        {venue.avg_rating && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-yellow-400 backdrop-blur-sm bg-opacity-95 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <StarFilled className="text-white text-sm" />
              <span className="font-bold text-white">{venue.avg_rating}</span>
              <span className="text-white text-xs opacity-90">({venue.review_count})</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3 bg-white">
        <h3 className="text-xl font-bold text-gray-800 line-clamp-1 hover:text-green-600 transition-colors">
          {venue.venue_name}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-start text-gray-600 hover:text-green-600 transition-colors">
            <EnvironmentOutlined className="mr-2 mt-0.5 text-green-600" />
            <span className="line-clamp-1 flex-1">{venue.location || 'ไม่ระบุสถานที่'}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ClockCircleOutlined className="mr-2 text-green-600" />
            <span>เปิด {venue.opening_time} - {venue.closing_time} น.</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100">
          <Button 
            type="primary" 
            block
            size="large"
            onClick={handleViewDetails}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold rounded-xl h-12 shadow-md hover:shadow-lg transition-all"
          >
            ดูรายละเอียดและจอง
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VenueCard;