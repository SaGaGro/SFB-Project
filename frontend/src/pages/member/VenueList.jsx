import { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Spin, Empty, Card, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import VenueCard from '../../components/common/VenueCard';
import api from '../../../services/api';

const { Search } = Input;
const { Option } = Select;

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [searchText, selectedType, venues]);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues?active=true');
      console.log('✅ Venues loaded:', response.data);
      setVenues(response.data || []);
      setFilteredVenues(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = venues;

    if (searchText) {
      filtered = filtered.filter(venue =>
        venue.venue_name.toLowerCase().includes(searchText.toLowerCase()) ||
        venue.location?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(venue => venue.venue_type === selectedType);
    }

    setFilteredVenues(filtered);
  };

  const venueTypes = [
    { value: 'all', label: 'ทั้งหมด', icon: '🏟️' },
    { value: 'badminton', label: 'แบดมินตัน', icon: '🏸' },
    { value: 'futsal', label: 'ฟุตซอล', icon: '⚽' },
    { value: 'basketball', label: 'บาสเกตบอล', icon: '🏀' },
    { value: 'other', label: 'อื่นๆ', icon: '🎾' },
  ];

  const venueStats = {
    total: venues.length,
    badminton: venues.filter(v => v.venue_type === 'badminton').length,
    futsal: venues.filter(v => v.venue_type === 'futsal').length,
    basketball: venues.filter(v => v.venue_type === 'basketball').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 -mx-4 -mt-8 px-4 py-16 mb-8">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 -ml-48 -mb-48"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              สนามกีฬาของเรา
            </h1>
            <p className="text-white text-xl opacity-95 mb-6">
              เลือกสาขาที่ใกล้คุณที่สุด พร้อมคอร์ทคุณภาพ
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30 hover:bg-opacity-30 transition-all">
              <div className="text-3xl mb-2">🏟️</div>
              <p className="text-white text-2xl font-bold">{venueStats.total}</p>
              <p className="text-white text-sm opacity-90">สนามทั้งหมด</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30 hover:bg-opacity-30 transition-all">
              <div className="text-3xl mb-2">🏸</div>
              <p className="text-white text-2xl font-bold">{venueStats.badminton}</p>
              <p className="text-white text-sm opacity-90">แบดมินตัน</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30 hover:bg-opacity-30 transition-all">
              <div className="text-3xl mb-2">⚽</div>
              <p className="text-white text-2xl font-bold">{venueStats.futsal}</p>
              <p className="text-white text-sm opacity-90">ฟุตซอล</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30 hover:bg-opacity-30 transition-all">
              <div className="text-3xl mb-2">🏀</div>
              <p className="text-white text-2xl font-bold">{venueStats.basketball}</p>
              <p className="text-white text-sm opacity-90">บาสเกตบอล</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="ค้นหาชื่อสาขา หรือสถานที่..."
                prefix={<SearchOutlined className="text-green-600" />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-green"
                allowClear
              />
            </div>
            
            <Select
              size="large"
              value={selectedType}
              onChange={setSelectedType}
              className="w-full md:w-64"
            >
              {venueTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>
        </Card>
      </div>

      {/* Venues Grid */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredVenues.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                พบ {filteredVenues.length} สนาม
              </h2>
              <div className="flex gap-2">
                <Tag color="green" className="px-4 py-1">
                  ✓ สนามมาตรฐาน
                </Tag>
                <Tag color="green" className="px-4 py-1">
                  ✓ อุปกรณ์ครบครัน
                </Tag>
              </div>
            </div>

            <Row gutter={[24, 24]}>
              {filteredVenues.map((venue) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={venue.venue_id}>
                  <VenueCard venue={venue} />
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <div className="text-center py-20">
            <Empty 
              description={
                <span className="text-gray-600 text-lg">
                  ไม่พบสนามที่ตรงกับเงื่อนไขการค้นหา
                </span>
              }
            />
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .search-green .ant-input-affix-wrapper:focus,
        .search-green .ant-input-affix-wrapper-focused {
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
};

export default VenueList;