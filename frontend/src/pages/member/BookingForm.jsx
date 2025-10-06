import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  DatePicker,
  Select,
  Button,
  Steps,
  message,
  Spin,
  Empty,
  Tag,
  Checkbox,
  InputNumber,
  Divider,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Option } = Select;

const BookingForm = () => {
  const { venueId, courtId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [venue, setVenue] = useState(null);
  const [court, setCourt] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchData();
  }, [venueId, courtId]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedDuration, selectedEquipment, court]);

  const fetchData = async () => {
    try {
      const [venueRes, courtsRes, equipmentRes] = await Promise.all([
        api.get(`/venues/${venueId}`),
        api.get(`/courts?venueId=${venueId}`),
        api.get(`/equipment?venueId=${venueId}`)
      ]);

      setVenue(venueRes.data);
      const courtData = courtsRes.data?.find(c => c.court_id === parseInt(courtId));
      setCourt(courtData);
      setEquipment(equipmentRes.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลได้');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!court) return;

    let price = court.hourly_rate * selectedDuration;

    selectedEquipment.forEach(item => {
      const equipmentItem = equipment.find(e => e.equipment_id === item.equipment_id);
      if (equipmentItem) {
        price += equipmentItem.rental_price * item.quantity;
      }
    });

    setTotalPrice(price);
  };

  const generateTimeSlots = () => {
    if (!venue) return [];

    const slots = [];
    const openTime = dayjs(venue.opening_time, 'HH:mm');
    const closeTime = dayjs(venue.closing_time, 'HH:mm');
    
    let current = openTime;
    
    while (current.isBefore(closeTime)) {
      slots.push(current.format('HH:mm'));
      current = current.add(30, 'minute');
    }
    
    return slots;
  };

  const generateDurationOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      options.push({
        value: i,
        label: `${i} ชั่วโมง`
      });
    }
    
    for (let i = 1; i <= 15; i++) {
      const hours = Math.floor((i + 1) / 2);
      const minutes = (i + 1) % 2 === 0 ? 0 : 30;
      if (minutes === 30) {
        options.push({
          value: hours + 0.5,
          label: `${hours} ชั่วโมง 30 นาที`
        });
      }
    }
    
    return options.slice(0, 16);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedStartTime(null);
    form.setFieldsValue({ start_time: null });
  };

  const handleEquipmentChange = (equipmentId, quantity) => {
    const newSelected = [...selectedEquipment];
    const index = newSelected.findIndex(item => item.equipment_id === equipmentId);
    
    if (quantity > 0) {
      if (index >= 0) {
        newSelected[index].quantity = quantity;
      } else {
        newSelected.push({ equipment_id: equipmentId, quantity });
      }
    } else {
      if (index >= 0) {
        newSelected.splice(index, 1);
      }
    }
    
    setSelectedEquipment(newSelected);
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const startTime = dayjs(selectedStartTime, 'HH:mm');
      const endTime = startTime.add(selectedDuration, 'hour');

      const bookingData = {
        venue_id: parseInt(venueId),
        court_id: parseInt(courtId),
        booking_date: selectedDate.format('YYYY-MM-DD'),
        start_time: selectedStartTime,
        end_time: endTime.format('HH:mm'),
        equipment: selectedEquipment
      };

      const response = await api.post('/bookings', bookingData);
      
      Modal.success({
        title: 'จองสำเร็จ',
        content: `รหัสการจอง: ${response.data.bookingId}`,
        onOk: () => navigate('/my-bookings')
      });
    } catch (error) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!venue || !court) {
    return <Empty description="ไม่พบข้อมูลสนามหรือคอร์ท" />;
  }

  const steps = [
    {
      title: 'เลือกวันและเวลา',
      icon: <CalendarOutlined />
    },
    {
      title: 'เลือกอุปกรณ์',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'ยืนยันการจอง',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div className="space-y-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/venues/${venueId}`)}
        size="large"
      >
        กลับ
      </Button>

      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">จองคอร์ท</h1>
          <div className="text-gray-600">
            <p className="font-semibold">{venue.venue_name}</p>
            <p>{court.court_name} - {court.hourly_rate} บาท/ชั่วโมง</p>
          </div>
        </div>

        <Steps current={currentStep} items={steps} className="mb-8" />

        <Form
          form={form}
          layout="vertical"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <Form.Item
                label="เลือกวันที่"
                name="booking_date"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
              >
                <DatePicker
                  size="large"
                  className="w-full"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                  onChange={handleDateChange}
                />
              </Form.Item>

              {selectedDate && (
                <>
                  <Form.Item
                    label="เลือกเวลาเริ่มต้น"
                    name="start_time"
                    rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
                  >
                    <Select
                      size="large"
                      placeholder="เลือกเวลา"
                      onChange={setSelectedStartTime}
                    >
                      {generateTimeSlots().map(time => (
                        <Option key={time} value={time}>
                          {time} น.
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="ระยะเวลา (ขั้นต่ำ 1 ชั่วโมง)"
                    name="duration"
                    rules={[{ required: true, message: 'กรุณาเลือกระยะเวลา' }]}
                  >
                    <Select
                      size="large"
                      placeholder="เลือกระยะเวลา"
                      value={selectedDuration}
                      onChange={setSelectedDuration}
                    >
                      {generateDurationOptions().map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {selectedStartTime && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">เวลาที่จอง</p>
                      <p className="font-semibold">
                        {selectedStartTime} - {dayjs(selectedStartTime, 'HH:mm').add(selectedDuration, 'hour').format('HH:mm')} น.
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        ราคาคอร์ท: {(court.hourly_rate * selectedDuration).toLocaleString()} บาท
                      </p>
                    </div>
                  )}
                </>
              )}

              <Button
                type="primary"
                size="large"
                block
                onClick={handleNext}
                disabled={!selectedDate || !selectedStartTime || !selectedDuration}
                className="bg-red-600 hover:bg-red-700"
              >
                ถัดไป
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">เลือกอุปกรณ์เสริม (ถ้าต้องการ)</h3>
                {equipment.length > 0 ? (
                  <div className="space-y-4">
                    {equipment.map(item => (
                      <Card key={item.equipment_id} size="small">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{item.equipment_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.rental_price} บาท/ชิ้น
                            </p>
                            <p className="text-xs text-gray-500">
                              คงเหลือ: {item.stock} ชิ้น
                            </p>
                          </div>
                          <div>
                            <InputNumber
                              min={0}
                              max={item.stock}
                              defaultValue={0}
                              onChange={(value) => handleEquipmentChange(item.equipment_id, value)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="ไม่มีอุปกรณ์ให้เช่า" />
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  block
                >
                  กลับ
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  block
                  className="bg-red-600 hover:bg-red-700"
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Card title="สรุปการจอง">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">สนาม</p>
                    <p className="font-semibold">{venue.venue_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">คอร์ท</p>
                    <p className="font-semibold">{court.court_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันที่</p>
                    <p className="font-semibold">
                      {selectedDate.format('DD/MM/YYYY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">เวลา</p>
                    <p className="font-semibold">
                      {selectedStartTime} - {dayjs(selectedStartTime, 'HH:mm').add(selectedDuration, 'hour').format('HH:mm')} น.
                    </p>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">รายการค่าใช้จ่าย</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>ค่าคอร์ท ({selectedDuration} ชั่วโมง)</span>
                        <span>{(court.hourly_rate * selectedDuration).toLocaleString()} บาท</span>
                      </div>
                      {selectedEquipment.length > 0 && (
                        <>
                          <p className="text-sm text-gray-600 mt-2">อุปกรณ์:</p>
                          {selectedEquipment.map(item => {
                            const equipmentItem = equipment.find(e => e.equipment_id === item.equipment_id);
                            return (
                              <div key={item.equipment_id} className="flex justify-between">
                                <span className="text-sm">
                                  {equipmentItem?.equipment_name} x {item.quantity}
                                </span>
                                <span className="text-sm">
                                  {(equipmentItem?.rental_price * item.quantity).toLocaleString()} บาท
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">ราคารวม</span>
                    <span className="text-2xl font-bold text-red-600">
                      {totalPrice.toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  size="large"
                  onClick={() => setCurrentStep(1)}
                  block
                >
                  กลับ
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={submitting}
                  block
                  className="bg-red-600 hover:bg-red-700"
                >
                  ยืนยันการจอง
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default BookingForm;