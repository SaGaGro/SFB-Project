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
        <span className="font-semibold text-green-600">
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
          {(record.status === 'pending' || record.status === 'paid') && (
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
      <div className="bg-gradient-to-r from-green-600 to-green-800 -mx-4 -mt-8 px-4 py-8 mb-8">
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
        title="รายละเอียดการจอง"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">รหัสการจอง</p>
                <p className="font-semibold text-lg">#{selectedBooking.booking_id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">สถานะ</p>
                <Tag color={statusConfig[selectedBooking.status]?.color}>
                  {statusConfig[selectedBooking.status]?.text}
                </Tag>
              </div>
              <div>
                <p className="text-gray-600 text-sm">สนาม</p>
                <p className="font-semibold">{selectedBooking.venue_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">คอร์ท</p>
                <p className="font-semibold">{selectedBooking.court_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">วันที่</p>
                <p className="font-semibold">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">เวลา</p>
                <p className="font-semibold">
                  {selectedBooking.start_time} - {selectedBooking.end_time} น.
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm">ราคารวม</p>
                <p className="font-bold text-2xl text-green-600">
                  {parseFloat(selectedBooking.total_price).toLocaleString()} บาท
                </p>
              </div>
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
              <div className="bg-white p-4 rounded-xl border-4 border-green-500 shadow-lg">
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

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">รหัสการจอง</span>
                  <span className="font-bold">#{qrCodeData.booking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนเงิน</span>
                  <span className="font-bold text-xl text-green-600">
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