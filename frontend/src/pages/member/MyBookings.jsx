import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, message, Space, Card, Spin } from 'antd';
import { EyeOutlined, CloseCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = async (booking) => {
    try {
      setLoadingQR(true);
      setQrModalVisible(true);
      
      // ดึงข้อมูล payment ที่มี QR Code
      const response = await api.get(`/payments?bookingId=${booking.booking_id}`);
      
      if (response.success && response.data.length > 0) {
        const payment = response.data[0];
        
        // ถ้ามี omise_charge_id ให้ดึง QR Code จาก Omise
        if (payment.omise_charge_id) {
          const chargeResponse = await api.get(`/omise/charge/${payment.omise_charge_id}`);
          
          setQrCodeData({
            booking_id: booking.booking_id,
            amount: payment.amount,
            charge_id: payment.omise_charge_id,
            qr_code_url: payment.qr_code, // URL ของ QR Code จาก database
            status: payment.status,
            paid_at: payment.paid_at,
            created_at: payment.created_at,
          });
        } else {
          message.warning('ไม่พบข้อมูล QR Code สำหรับการจองนี้');
          setQrModalVisible(false);
        }
      } else {
        message.warning('ไม่พบข้อมูลการชำระเงิน');
        setQrModalVisible(false);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      message.error('ไม่สามารถโหลด QR Code ได้');
      setQrModalVisible(false);
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.put(`/bookings/${selectedBooking.booking_id}/cancel`, {
        cancellation_reason: 'ยกเลิกโดยผู้ใช้',
      });
      message.success('ยกเลิกการจองสำเร็จ');
      setCancelModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error('ไม่สามารถยกเลิกการจองได้');
    }
  };

  const statusConfig = {
    pending: { color: 'orange', text: 'รอชำระเงิน' },
    confirmed: { color: 'blue', text: 'ยืนยันแล้ว' },
    paid: { color: 'green', text: 'ชำระแล้ว' },
    cancelled: { color: 'red', text: 'ยกเลิก' },
  };

  const columns = [
    {
      title: 'รหัสการจอง',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 100,
    },
    {
      title: 'สนาม',
      dataIndex: 'venue_name',
      key: 'venue_name',
    },
    {
      title: 'คอร์ท',
      dataIndex: 'court_name',
      key: 'court_name',
    },
    {
      title: 'วันที่',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (date) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'เวลา',
      key: 'time',
      render: (_, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: 'ราคา',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => (
        <span className="font-semibold text-orange-600">
          {parseFloat(price).toLocaleString()} บาท
        </span>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, text } = statusConfig[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setDetailModalVisible(true);
            }}
          >
            ดู
          </Button>
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => handleViewQR(record)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              QR Code
            </Button>
          )}
          {record.status !== 'cancelled' && record.status !== 'paid' && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setCancelModalVisible(true);
              }}
            >
              ยกเลิก
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 -mx-4 -mt-8 px-4 py-8 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">การจองของฉัน</h1>
          <p className="text-white opacity-90 mt-2">
            ดูและจัดการการจองคอร์ทกีฬาของคุณ
          </p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="booking_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
        className="booking-detail-modal"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-700 -mx-6 -mt-6 px-6 py-6 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white mb-2">รายละเอียดการจอง</h2>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm opacity-90">รหัสการจอง</p>
                  <p className="text-xl font-bold">#{selectedBooking.booking_id}</p>
                </div>
                <Tag
                  color={statusConfig[selectedBooking.status]?.color}
                  className="text-base px-4 py-1 m-0"
                >
                  {statusConfig[selectedBooking.status]?.text}
                </Tag>
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">สนาม</p>
                    <p className="font-bold text-lg text-gray-800">{selectedBooking.venue_name}</p>
                  </div>
                </div>
                <div className="border-t border-orange-200 pt-3">
                  <p className="text-gray-600 text-sm mb-1">คอร์ท</p>
                  <p className="font-semibold text-gray-800">{selectedBooking.court_name}</p>
                </div>
              </div>
            </div>

            {/* Date & Time Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-600 text-sm mb-2">วันที่</p>
                <p className="font-bold text-gray-800">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-600 text-sm mb-2">เวลา</p>
                <p className="font-bold text-gray-800">
                  {selectedBooking.start_time} - {selectedBooking.end_time} น.
                </p>
              </div>
            </div>

            {/* Equipment Section */}
            {selectedBooking.equipment && selectedBooking.equipment.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                  <span className="text-purple-600">🏀</span> อุปกรณ์ที่เช่า
                </p>
                <div className="space-y-2">
                  {selectedBooking.equipment.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border border-purple-100">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.equipment_name}</p>
                        <p className="text-sm text-gray-600">จำนวน: {item.quantity} ชิ้น</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">ราคา/ชิ้น</p>
                        <p className="font-semibold text-purple-600">
                          {parseFloat(item.rental_price || 0).toLocaleString()} บาท
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">ราคาอุปกรณ์รวม</span>
                  <span className="font-bold text-lg text-purple-600">
                    {selectedBooking.equipment.reduce((sum, item) =>
                      sum + (parseFloat(item.rental_price || 0) * item.quantity), 0
                    ).toLocaleString()} บาท
                  </span>
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-6 border-2 border-orange-300 text-center">
              <p className="text-gray-700 text-sm mb-2">ราคารวมทั้งหมด</p>
              <p className="font-bold text-4xl text-orange-600">
                {parseFloat(selectedBooking.total_price).toLocaleString()} <span className="text-2xl">บาท</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {selectedBooking.status === 'pending' && (
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleViewQR(selectedBooking);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
                  size="large"
                >
                  ดู QR Code
                </Button>
              )}
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'paid' && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    setCancelModalVisible(true);
                  }}
                  className="flex-1 h-10"
                  size="large"
                >
                  ยกเลิกการจอง
                </Button>
              )}
              {selectedBooking.status === 'paid' && (
                <div className="flex-1 bg-green-100 border-2 border-green-500 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold">
                    ✅ ชำระเงินเรียบร้อยแล้ว
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    พร้อมใช้บริการตามวันและเวลาที่จอง
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="ยืนยันการยกเลิก"
        open={cancelModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้</p>
        <p className="text-gray-600 text-sm mt-2">
          การยกเลิกจะไม่สามารถกู้คืนได้
        </p>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title="QR Code สำหรับชำระเงิน"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            ปิด
          </Button>
        ]}
        width={500}
      >
        {loadingQR ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : qrCodeData ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border-4 border-orange-500 shadow-lg">
                {qrCodeData.qr_code_url ? (
                  <img 
                    src={qrCodeData.qr_code_url} 
                    alt="QR Code" 
                    className="w-64 h-64 object-contain" 
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">ไม่พบ QR Code</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">รหัสการจอง</span>
                  <span className="font-bold">#{qrCodeData.booking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนเงิน</span>
                  <span className="font-bold text-xl text-orange-600">
                    {parseFloat(qrCodeData.amount).toLocaleString()} บาท
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะ</span>
                  <Tag color={qrCodeData.status === 'paid' ? 'green' : 'orange'}>
                    {qrCodeData.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระเงิน'}
                  </Tag>
                </div>
                {qrCodeData.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชำระเมื่อ</span>
                    <span className="text-sm">
                      {new Date(qrCodeData.paid_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                )}
                {qrCodeData.charge_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Charge ID</span>
                    <span className="text-xs font-mono">{qrCodeData.charge_id}</span>
                  </div>
                )}
              </div>
            </div>

            {qrCodeData.status !== 'paid' && (
              <>
                <div className="text-left bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">📱 วิธีชำระเงิน:</p>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>เปิดแอพธนาคารของคุณ</li>
                    <li>เลือกสแกน QR Code</li>
                    <li>สแกน QR Code ด้านบน</li>
                    <li>ยืนยันการชำระเงิน</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>หมายเหตุ:</strong> QR Code นี้มีอายุ 15 นาที หากหมดเวลาจะต้องสร้างใหม่
                  </p>
                </div>
              </>
            )}

            {qrCodeData.status === 'paid' && (
              <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✅ ชำระเงินสำเร็จแล้ว
                </p>
                <p className="text-sm text-green-700 mt-1">
                  คุณสามารถใช้บริการได้ตามวันและเวลาที่จอง
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">ไม่พบข้อมูล QR Code</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;