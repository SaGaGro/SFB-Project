import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  InputNumber,
  Divider,
  Modal,
  Result,
  Statistic,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QrcodeOutlined,
  DollarOutlined,
  CopyOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import api from "../../../services/api";

const { Option } = Select;
const { confirm } = Modal;
const { Countdown } = Statistic;

const BookingForm = () => {
  const { venueId, courtId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

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
  const [bookedSlots, setBookedSlots] = useState([]);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentDeadline, setPaymentDeadline] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [venueId, courtId]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedDuration, selectedEquipment, court]);

  useEffect(() => {
    let interval;
    if (paymentModalVisible && paymentData?.chargeId) {
      // เช็คทันทีตอนเปิด modal
      checkPaymentStatusPeriodically();

      // จากนั้นเช็คทุก 5 วินาที
      interval = setInterval(() => {
        checkPaymentStatusPeriodically();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentModalVisible, paymentData]);

  const fetchData = async () => {
    try {
      const [venueRes, courtsRes, equipmentRes] = await Promise.all([
        api.get(`/venues/${venueId}`),
        api.get(`/courts?venueId=${venueId}`),
        api.get(`/equipment?venueId=${venueId}`),
      ]);

      setVenue(venueRes.data);
      const courtData = courtsRes.data?.find(
        (c) => c.court_id === parseInt(courtId)
      );
      setCourt(courtData);
      setEquipment(equipmentRes.data || []);
    } catch (error) {
      messageApi.error("ไม่สามารถโหลดข้อมูลได้");
      navigate(`/member/venues/${venueId}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!court) return;

    let price = court.hourly_rate * selectedDuration;

    selectedEquipment.forEach((item) => {
      const equipmentItem = equipment.find(
        (e) => e.equipment_id === item.equipment_id
      );
      if (equipmentItem) {
        price += equipmentItem.rental_price * item.quantity;
      }
    });

    setTotalPrice(price);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedStartTime(null);
    form.setFieldsValue({ start_time: null });

    if (date && courtId) {
      fetchBookedSlots(courtId, date.format("YYYY-MM-DD"));
    }
  };

  const fetchBookedSlots = async (courtId, date) => {
    try {
      const response = await api.get(
        `/bookings/booked-slots?courtId=${courtId}&date=${date}`
      );

      if (response.success) {
        console.log("📅 Fetched booked slots:", response.data);
        setBookedSlots(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
    }
  };

  const timeToMinutes = (timeStr) => {
    const [hour, min] = timeStr.split(":").map(Number);
    return hour * 60 + min;
  };

  // [แก้ไข] อัปเดตฟังก์ชันนี้เพื่อตรวจสอบเวลาย้อนหลัง
  const generateTimeSlots = () => {
    if (!venue || !selectedDate) return []; // [แก้ไข] เพิ่มการตรวจสอบ selectedDate

    const slots = [];
    const openTime = dayjs(venue.opening_time, "HH:mm");
    const closeTime = dayjs(venue.closing_time, "HH:mm");

    const now = dayjs(); // [แก้ไข] ดึงเวลาปัจจุบัน
    const isToday = selectedDate.isSame(now, "day"); // [แก้ไข] ตรวจสอบว่าเป็นวันนี้หรือไม่

    let current = openTime;

    while (current.isBefore(closeTime)) {
      const currentTime = current.format("HH:mm");
      const currentMinutes = timeToMinutes(currentTime);

      // ตรวจสอบการจอง (isBooked)
      const bookedSlot = bookedSlots.find((slot) => {
        const startMinutes = timeToMinutes(slot.start_time);
        const endMinutes = timeToMinutes(slot.end_time);
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      });
      const isBooked = !!bookedSlot;

      // [แก้ไข] ตรวจสอบเวลาที่ผ่านมาแล้ว (isPast)
      // 'current' คือ dayjs object ที่มีวันที่เป็น "วันนี้" และเวลาของ slot
      // เราจะตรวจสอบว่า 'current' (เวลาของ slot) มาก่อน 'now' (เวลาปัจจุบัน) หรือไม่
      // โดยจะตรวจสอบก็ต่อเมื่อวันที่เลือกคือ 'วันนี้' (isToday)
      const isPast = isToday && current.isBefore(now);

      slots.push({
        time: currentTime,
        isBooked: isBooked,
        status: bookedSlot?.status || null,
        isPast: isPast, // [แก้ไข] เพิ่ม property ใหม่
      });

      current = current.add(30, "minute");
    }

    return slots;
  };

  const generateDurationOptions = () => {
    if (!selectedStartTime) return [];

    const options = [];
    const startMinutes = timeToMinutes(selectedStartTime);
    let maxDuration = 8;

    for (const slot of bookedSlots) {
      const slotStartMinutes = timeToMinutes(slot.start_time);
      if (slotStartMinutes > startMinutes) {
        const availableMinutes = slotStartMinutes - startMinutes;
        const availableHours = availableMinutes / 60;
        maxDuration = Math.min(maxDuration, availableHours);
      }
    }

    if (venue) {
      const closeMinutes = timeToMinutes(venue.closing_time);
      const availableUntilClose = (closeMinutes - startMinutes) / 60;
      maxDuration = Math.min(maxDuration, availableUntilClose);
    }

    for (let i = 0.5; i <= maxDuration; i += 0.5) {
      if (i >= 1) {
        const hours = Math.floor(i);
        const minutes = (i % 1) * 60;
        const label =
          minutes === 0
            ? `${hours} ชั่วโมง`
            : `${hours} ชั่วโมง ${minutes} นาที`;
        options.push({ value: i, label: label });
      }
    }

    if (options.length === 0) {
      options.push({ value: 1, label: "1 ชั่วโมง (สูงสุดที่จองได้)" });
    }

    return options;
  };

  const handleEquipmentChange = (equipmentId, quantity) => {
    const newSelected = [...selectedEquipment];
    const index = newSelected.findIndex(
      (item) => item.equipment_id === equipmentId
    );

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

  const checkTimeConflict = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const conflictSlots = [];

    bookedSlots.forEach((slot) => {
      const slotStartMinutes = timeToMinutes(slot.start_time);
      const slotEndMinutes = timeToMinutes(slot.end_time);

      const isConflict =
        (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
        (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
        (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes);

      if (isConflict) {
        conflictSlots.push(slot);
      }
    });

    return conflictSlots.length > 0 ? conflictSlots : null;
  };

  const handleNext = async () => {
    try {
      await form.validateFields();

      if (currentStep === 0 && selectedStartTime && selectedDuration) {
        const startTime = selectedStartTime;
        const endTime = dayjs(selectedStartTime, "HH:mm")
          .add(selectedDuration, "hour")
          .format("HH:mm");

        const conflicts = checkTimeConflict(startTime, endTime);

        if (conflicts) {
          modal.warning({
            title: "⚠️ เวลาทับซ้อน",
            content: (
              <div>
                <p style={{ marginBottom: "12px" }}>
                  ช่วงเวลาที่คุณเลือก{" "}
                  <strong>
                    {startTime} - {endTime} น.
                  </strong>{" "}
                  มีการจองอยู่แล้ว:
                </p>
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  {conflicts.map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom:
                          index < conflicts.length - 1 ? "8px" : "0",
                      }}
                    >
                      <Tag
                        color={
                          slot.status === "paid" || slot.status === "confirmed"
                            ? "red"
                            : "orange"
                        }
                      >
                        {slot.status === "paid"
                          ? "จองแล้ว"
                          : slot.status === "confirmed"
                          ? "ยืนยันแล้ว"
                          : "รอชำระ"}
                      </Tag>
                      <span style={{ fontSize: "14px" }}>
                        {slot.start_time} - {slot.end_time} น.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
            okText: "เลือกเวลาใหม่",
            width: 500,
          });
          return;
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const startTime = dayjs(selectedStartTime, "HH:mm");
      const endTime = startTime.add(selectedDuration, "hour");

      const bookingData = {
        venue_id: parseInt(venueId),
        court_id: parseInt(courtId),
        booking_date: selectedDate.format("YYYY-MM-DD"),
        start_time: selectedStartTime,
        end_time: endTime.format("HH:mm"),
        equipment: selectedEquipment,
      };

      console.log("📤 Submitting booking:", bookingData);

      // 1. สร้างการจอง
      const bookingResponse = await api.post("/bookings", bookingData);

      if (bookingResponse.success) {
        const bookingId = bookingResponse.data.bookingId;

        console.log("✅ Booking created:", bookingId);

        // 2. สร้าง Omise Charge
        try {
          const chargeResponse = await api.post("/omise/create-charge", {
            booking_id: bookingId,
          });

          if (chargeResponse.success) {
            console.log("✅ Omise charge created:", chargeResponse.data);

            const deadline = new Date(Date.now() + 5 * 60 * 1000);
            setPaymentData({
              bookingId: bookingId,
              chargeId: chargeResponse.data.charge_id,
              totalPrice: chargeResponse.data.amount,
              qrCodeUrl: chargeResponse.data.qr_code_url,
              expiresAt: chargeResponse.data.expires_at,
            });
            setPaymentDeadline(deadline);
            setPaymentModalVisible(true);
          }
        } catch (chargeError) {
          console.error("❌ Charge creation error:", chargeError);
          messageApi.error(
            "สร้างการจองสำเร็จ แต่เกิดข้อผิดพลาดในการสร้าง QR Code"
          );
          navigate("/member/my-bookings");
        }
      }
    } catch (error) {
      console.error("❌ Booking error:", error);
      messageApi.error(error.message || "เกิดข้อผิดพลาดในการจอง");
    } finally {
      setSubmitting(false);
    }
  };

  const checkPaymentStatusPeriodically = async () => {
    if (!paymentData?.chargeId) return;

    setCheckingPayment(true);
    try {
      const response = await api.get(`/omise/charge/${paymentData.chargeId}`);

      console.log("🔍 Payment status:", response.data);

      if (response.success && response.data.paid) {
        setPaymentModalVisible(false);
        modal.success({
          title: "✅ ชำระเงินสำเร็จ",
          content: "การชำระเงินของคุณได้รับการยืนยันแล้ว",
          okText: "ไปหน้าการจอง",
          onOk: () => navigate("/member/my-bookings"),
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
    { title: "เลือกวันและเวลา", icon: <CalendarOutlined /> },
    { title: "เลือกอุปกรณ์", icon: <ClockCircleOutlined /> },
    { title: "ยืนยันการจอง", icon: <CheckCircleOutlined /> },
  ];

  return (
    <>
      {contextHolder}
      {modalContextHolder}

      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="large">
          กลับ
        </Button>

        <Card>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">จองคอร์ท</h1>
            <div className="text-gray-600">
              <p className="font-semibold">{venue.venue_name}</p>
              <p>
                {court.court_name} - {court.hourly_rate} บาท/ชั่วโมง
              </p>
            </div>
          </div>

          <Steps current={currentStep} items={steps} className="mb-8" />

          <Form form={form} layout="vertical">
            {currentStep === 0 && (
              <div className="space-y-6">
                <Form.Item
                  label="เลือกวันที่"
                  name="booking_date"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
                >
                  <DatePicker
                    size="large"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                    onChange={handleDateChange}
                  />
                </Form.Item>

                {selectedDate && (
                  <>
                    <Form.Item
                      label="เลือกเวลาเริ่มต้น"
                      name="start_time"
                      rules={[{ required: true, message: "กรุณาเลือกเวลา" }]}
                    >
                      <Select
                        size="large"
                        placeholder="เลือกเวลา"
                        onChange={setSelectedStartTime}
                      >
                        {/* [แก้ไข] อัปเดต Logic การแสดงผลใน Dropdown */}
                        {generateTimeSlots().map((slot) => {
                          let backgroundColor = "white";
                          let textColor = "inherit";
                          let tagText = null;
                          let tagColor = "default";
                          let isDisabled = false;

                          if (slot.isBooked) {
                            isDisabled = true;
                            if (
                              slot.status === "paid" ||
                              slot.status === "confirmed"
                            ) {
                              backgroundColor = "#ffe4e1"; // Red-ish
                              textColor = "#dc3545";
                              tagText = "จองแล้ว";
                              tagColor = "red";
                            } else if (slot.status === "pending") {
                              backgroundColor = "#fff4e6"; // Orange-ish
                              textColor = "#f59e0b";
                              tagText = "รอชำระเงิน";
                              tagColor = "orange";
                            }
                          } else if (slot.isPast) {
                            // Logic ใหม่สำหรับเวลาที่ผ่านมาแล้ว
                            isDisabled = true;
                            backgroundColor = "#f5f5f5"; // Light gray
                            textColor = "#bfbfbf";
                            tagText = "หมดเวลา";
                            tagColor = "default";
                          }

                          return (
                            <Option
                              key={slot.time}
                              value={slot.time}
                              disabled={isDisabled} // ใช้ isDisabled ที่เราคำนวณไว้
                              style={{ backgroundColor, color: textColor }}
                            >
                              <div className="flex justify-between items-center">
                                <span>{slot.time} น.</span>
                                {tagText && ( // แสดง Tag เมื่อมีข้อความ
                                  <Tag color={tagColor} className="ml-2">
                                    {tagText}
                                  </Tag>
                                )}
                              </div>
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="ระยะเวลา"
                      name="duration"
                      rules={[
                        { required: true, message: "กรุณาเลือกระยะเวลา" },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="เลือกระยะเวลา"
                        value={selectedDuration}
                        onChange={setSelectedDuration}
                        disabled={!selectedStartTime}
                      >
                        {generateDurationOptions().map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {selectedStartTime && selectedDuration && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">เวลาที่จอง</p>
                        <p className="font-semibold text-lg text-blue-700">
                          {selectedStartTime} -{" "}
                          {dayjs(selectedStartTime, "HH:mm")
                            .add(selectedDuration, "hour")
                            .format("HH:mm")}{" "}
                          น.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          ราคาคอร์ท:{" "}
                          <span className="font-semibold text-green-600">
                            {(
                              court.hourly_rate * selectedDuration
                            ).toLocaleString()}{" "}
                            บาท
                          </span>
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
                  disabled={
                    !selectedDate || !selectedStartTime || !selectedDuration
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  ถัดไป
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    เลือกอุปกรณ์เสริม (ถ้าต้องการ)
                  </h3>
                  {equipment.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {equipment.map((item) => (
                        <Card
                          key={item.equipment_id}
                          hoverable
                          size="small"
                          className="overflow-hidden rounded-lg h-full"
                          cover={
                            item.images && item.images.length > 0 ? (
                              <div style={{ height: 180, overflow: "hidden", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                                <Image.PreviewGroup>
                                  <Image
                                    alt={item.equipment_name}
                                    src={`${import.meta.env.VITE_BASE_URL}${
                                      item.images[0]
                                    }`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                  {item.images.slice(1).map((img, index) => (
                                    <Image
                                      key={index}
                                      src={`${import.meta.env.VITE_BASE_URL}${img}`}
                                      style={{ display: "none" }}
                                    />
                                  ))}
                                </Image.PreviewGroup>
                                {item.images.length > 1 && (
                                  <div style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                                    +{item.images.length - 1}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                style={{
                                  height: 180,
                                  backgroundColor: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ShoppingOutlined
                                  style={{ fontSize: 60, color: "#bfbfbf" }}
                                />
                              </div>
                            )
                          }
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-base">
                              {item.equipment_name}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-green-600 font-semibold">
                                  {parseFloat(item.rental_price).toFixed(2)} บาท/ชิ้น
                                </p>
                                <Tag
                                  color={
                                    item.stock > 10
                                      ? "green"
                                      : item.stock > 5
                                      ? "orange"
                                      : "red"
                                  }
                                  style={{ margin: 0 }}
                                >
                                  เหลือ {item.stock}
                                </Tag>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">จำนวน:</span>
                                <InputNumber
                                  min={0}
                                  max={item.stock}
                                  defaultValue={
                                    selectedEquipment.find(
                                      (e) => e.equipment_id === item.equipment_id
                                    )?.quantity || 0
                                  }
                                  onChange={(value) =>
                                    handleEquipmentChange(item.equipment_id, value)
                                  }
                                  size="small"
                                  style={{ width: 70 }}
                                />
                              </div>
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
                  <Button size="large" onClick={() => setCurrentStep(0)} block>
                    กลับ
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    block
                    className="bg-green-600 hover:bg-green-700"
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
                        {selectedDate.format("DD/MM/YYYY")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">เวลา</p>
                      <p className="font-semibold">
                        {selectedStartTime} -{" "}
                        {dayjs(selectedStartTime, "HH:mm")
                          .add(selectedDuration, "hour")
                          .format("HH:mm")}{" "}
                        น.
                      </p>
                    </div>

                    <Divider />

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        รายการค่าใช้จ่าย
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>ค่าคอร์ท ({selectedDuration} ชั่วโมง)</span>
                          <span>
                            {(
                              court.hourly_rate * selectedDuration
                            ).toLocaleString()}{" "}
                            บาท
                          </span>
                        </div>
                        {selectedEquipment.length > 0 && (
                          <>
                            <p className="text-sm text-gray-600 mt-2">
                              อุปกรณ์:
                            </p>
                            {selectedEquipment.map((item) => {
                              const equipmentItem = equipment.find(
                                (e) => e.equipment_id === item.equipment_id
                              );
                              return (
                                <div
                                  key={item.equipment_id}
                                  className="flex justify-between"
                                >
                                  <span className="text-sm">
                                    {equipmentItem?.equipment_name} x{" "}
                                    {item.quantity}
                                  </span>
                                  <span className="text-sm">
                                    {(
                                      equipmentItem?.rental_price *
                                      item.quantity
                                    ).toLocaleString()}{" "}
                                    บาท
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
                      <span className="text-2xl font-bold text-green-600">
                        {totalPrice.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button size="large" onClick={() => setCurrentStep(1)} block>
                    กลับ
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={submitting}
                    block
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ยืนยันการจอง
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </Card>
      </div>

      {/* Payment Modal with Omise QR Code */}
      <Modal
        open={paymentModalVisible}
        onCancel={() => {
          // เปลี่ยนจาก Modal.confirm เป็น modal.confirm
          modal.confirm({
            title: "ยกเลิกการชำระเงิน?",
            content:
              "หากคุณปิดหน้าต่างนี้ การจองจะถูกยกเลิกเมื่อหมดเวลา 5 นาที",
            okText: "ปิดหน้าต่าง",
            cancelText: "อยู่ต่อ",
            okType: "danger", // เพิ่มเพื่อให้เป็นปุ่มแดง
            onOk: () => {
              setPaymentModalVisible(false);
              navigate("/member/my-bookings");
            },
            // เพิ่ม onCancel เพื่อไม่ทำอะไรเมื่อกดยกเลิก
            onCancel: () => {
              // ไม่ทำอะไร - ให้อยู่ใน modal เดิม
            },
          });
        }}
        footer={null}
        width={600}
        closable={true} // ตรวจสอบว่ามี true
        maskClosable={false} // เพิ่มเพื่อไม่ให้ปิดเมื่อคลิกนอก Modal
      >
        <div className="text-center py-6">
          <Result
            status="success"
            icon={<QrcodeOutlined style={{ color: "#52c41a" }} />}
            title={
              <span className="text-2xl font-bold">
                สแกน QR Code เพื่อชำระเงิน
              </span>
            }
          />

          {paymentDeadline && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">⏰ กรุณาชำระเงินภายใน</p>
              <Countdown
                value={paymentDeadline}
                format="mm:ss"
                valueStyle={{
                  color: "#f5222d",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
                onFinish={() => {
                  messageApi.warning("หมดเวลาชำระเงิน");
                  setPaymentModalVisible(false);
                  navigate("/member/my-bookings");
                }}
              />
            </div>
          )}

          {paymentData && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl border-4 border-green-500 shadow-lg">
                  {paymentData.qrCodeUrl ? (
                    <img
                      src={paymentData.qrCodeUrl}
                      alt="Omise QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <Spin size="large" />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รหัสการจอง</span>
                    <span className="font-bold text-lg">
                      #{paymentData.bookingId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">จำนวนเงิน</span>
                    <span className="font-bold text-2xl text-green-600">
                      {paymentData.totalPrice?.toLocaleString()} บาท
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Charge ID</span>
                    <span className="text-xs font-mono text-gray-500">
                      {paymentData.chargeId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">
                  📱 วิธีชำระเงินผ่าน PromptPay:
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>เปิดแอพธนาคารของคุณ (ต้องรองรับ PromptPay)</li>
                  <li>เลือกเมนู "สแกน QR Code" หรือ "QR Payment"</li>
                  <li>สแกน QR Code ด้านบน</li>
                  <li>ตรวจสอบจำนวนเงินให้ถูกต้อง</li>
                  <li>ยืนยันการชำระเงิน</li>
                  <li>รอระบบตรวจสอบการชำระเงิน (ประมาณ 5-10 วินาที)</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <ExclamationCircleOutlined className="text-yellow-600 mt-0.5" />
                  <span>
                    <strong>สำคัญ:</strong> QR Code นี้ใช้ได้เพียงครั้งเดียว
                    และหมดอายุใน 5 นาที หากชำระเงินเกินเวลา
                    ระบบจะยกเลิกการจองอัตโนมัติ
                  </span>
                </p>
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={checkingPayment}
                onClick={checkPaymentStatusPeriodically}
                className="bg-green-600 hover:bg-green-700 h-12"
              >
                {checkingPayment
                  ? "กำลังตรวจสอบ..."
                  : "ตรวจสอบสถานะการชำระเงิน"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                💡 ระบบจะตรวจสอบสถานะการชำระเงินอัตโนมัติทุก 5 วินาที
                <br />
                หากชำระเงินสำเร็จ ระบบจะแจ้งเตือนทันที
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BookingForm;