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
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../services/api";

const { Option } = Select;
const { confirm } = Modal;

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

  const generateTimeSlots = () => {
    if (!venue) return [];

    const slots = [];
    const openTime = dayjs(venue.opening_time, "HH:mm");
    const closeTime = dayjs(venue.closing_time, "HH:mm");

    let current = openTime;

    while (current.isBefore(closeTime)) {
      const currentTime = current.format("HH:mm");
      const currentMinutes = timeToMinutes(currentTime);

      const isBooked = bookedSlots.some((slot) => {
        const startMinutes = timeToMinutes(slot.start_time);
        const endMinutes = timeToMinutes(slot.end_time);

        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      });

      const bookedSlot = bookedSlots.find((slot) => {
        const startMinutes = timeToMinutes(slot.start_time);
        const endMinutes = timeToMinutes(slot.end_time);

        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      });

      slots.push({
        time: currentTime,
        isBooked: isBooked,
        status: bookedSlot?.status || null,
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
      const slotEndMinutes = timeToMinutes(slot.end_time);

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

        options.push({
          value: i,
          label: label,
        });
      }
    }

    if (options.length === 0) {
      options.push({
        value: 1,
        label: "1 ชั่วโมง (สูงสุดที่จองได้)",
      });
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
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "12px",
                  }}
                >
                  กรุณาเลือกช่วงเวลาอื่นที่ไม่ทับกับการจองที่มีอยู่
                </p>
              </div>
            ),
            okText: "เลือกเวลาใหม่",
            width: 500,
            icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
          });
          return;
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const confirmBooking = () => {
    const startTime = selectedStartTime;
    const endTime = dayjs(selectedStartTime, "HH:mm")
      .add(selectedDuration, "hour")
      .format("HH:mm");

    modal.confirm({
      title: "📝 ยืนยันการจอง",
      icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
      width: 520,
      content: (
        <div>
          <p style={{ marginBottom: "16px", fontSize: "15px", color: "#374151" }}>
            คุณต้องการยืนยันการจองคอร์ทนี้ใช่หรือไม่?
          </p>
          
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                สนาม
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {venue.venue_name}
              </p>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                คอร์ท
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {court.court_name}
              </p>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                วันที่
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {selectedDate.format("DD/MM/YYYY")}
              </p>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                เวลา
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {startTime} - {endTime} น.
              </p>
            </div>

            {selectedEquipment.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                  อุปกรณ์เสริม
                </p>
                {selectedEquipment.map((item) => {
                  const equipmentItem = equipment.find(
                    (e) => e.equipment_id === item.equipment_id
                  );
                  return (
                    <p
                      key={item.equipment_id}
                      style={{ fontSize: "14px", color: "#374151", marginBottom: "2px" }}
                    >
                      • {equipmentItem?.equipment_name} x {item.quantity}
                    </p>
                  );
                })}
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "12px",
                marginTop: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                  ราคารวมทั้งหมด
                </p>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>
                  {totalPrice.toLocaleString()} บาท
                </p>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "12px" }}>
            💡 กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการจอง
          </p>
        </div>
      ),
      okText: "ยืนยันการจอง",
      cancelText: "ยกเลิก",
      okButtonProps: {
        style: {
          backgroundColor: "#16a34a",
          borderColor: "#16a34a",
        },
      },
      onOk: () => handleSubmit(),
    });
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

      const response = await api.post("/bookings", bookingData);

      if (response.success) {
        modal.success({
          title: "✅ จองสำเร็จ",
          content: (
            <div>
              <p style={{ marginBottom: "8px" }}>
                รหัสการจอง:{" "}
                <strong style={{ color: "#16a34a" }}>
                  #{response.data.bookingId}
                </strong>
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                คุณสามารถดูรายละเอียดการจองได้ที่หน้า "การจองของฉัน"
              </p>
            </div>
          ),
          okText: "ไปหน้าการจอง",
          onOk: () => navigate("/member/my-bookings"),
        });
      }
    } catch (error) {
      console.error("❌ Booking error:", error);

      let errorMessage = "เกิดข้อผิดพลาดในการจอง";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      modal.error({
        title: "❌ ไม่สามารถจองได้",
        content: (
          <div>
            <p
              style={{
                marginBottom: "12px",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              {errorMessage}
            </p>
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                💡 คำแนะนำ:
              </p>
              <ul
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  paddingLeft: "20px",
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: "4px" }}>
                  ลองเลือกช่วงเวลาอื่นที่ไม่ทับกับการจองที่มีอยู่
                </li>
                <li style={{ marginBottom: "4px" }}>
                  ตรวจสอบว่าคอร์ทยังว่างอยู่หรือไม่
                </li>
                <li style={{ marginBottom: "4px" }}>
                  รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด
                </li>
                <li>หากมีปัญหาติดต่อเจ้าหน้าที่</li>
              </ul>
            </div>
          </div>
        ),
        okText: "เลือกเวลาใหม่",
        width: 500,
        onOk: () => {
          setCurrentStep(0);
          if (selectedDate && courtId) {
            fetchBookedSlots(courtId, selectedDate.format("YYYY-MM-DD"));
          }
        },
      });

      messageApi.error(errorMessage);
    } finally {
      setSubmitting(false);
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
    {
      title: "เลือกวันและเวลา",
      icon: <CalendarOutlined />,
    },
    {
      title: "เลือกอุปกรณ์",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "ยืนยันการจอง",
      icon: <CheckCircleOutlined />,
    },
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
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
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
                        {generateTimeSlots().map((slot) => {
                          let backgroundColor = "white";
                          let textColor = "inherit";

                          if (slot.isBooked) {
                            if (
                              slot.status === "paid" ||
                              slot.status === "confirmed"
                            ) {
                              backgroundColor = "#ffe4e1";
                              textColor = "#dc3545";
                            } else if (slot.status === "pending") {
                              backgroundColor = "#fff4e6";
                              textColor = "#f59e0b";
                            }
                          }

                          return (
                            <Option
                              key={slot.time}
                              value={slot.time}
                              disabled={slot.isBooked}
                              style={{
                                backgroundColor: backgroundColor,
                                color: textColor,
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span>{slot.time} น.</span>
                                {slot.isBooked && (
                                  <Tag
                                    color={
                                      slot.status === "paid" ||
                                      slot.status === "confirmed"
                                        ? "red"
                                        : "orange"
                                    }
                                    className="ml-2"
                                  >
                                    {slot.status === "paid"
                                      ? "จองแล้ว"
                                      : slot.status === "confirmed"
                                      ? "ยืนยันแล้ว"
                                      : "รอชำระเงิน"}
                                  </Tag>
                                )}
                              </div>
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="ระยะเวลา (ขั้นต่ำ 1 ชั่วโมง)"
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
                        <p className="text-sm text-gray-600 mb-1">
                          เวลาที่จอง
                        </p>
                        <p className="font-semibold text-lg text-blue-700">
                          {selectedStartTime} -{" "}
                          {dayjs(selectedStartTime, "HH:mm")
                            .add(selectedDuration, "hour")
                            .format("HH:mm")}{" "}
                          น.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          ระยะเวลา:{" "}
                          <span className="font-semibold">
                            {selectedDuration} ชั่วโมง
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
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

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold mb-3 text-gray-700">
                        📌 คำอธิบายสถานะ:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-white border-2 border-green-500 rounded flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <span className="text-gray-700">
                            ว่าง - สามารถจองได้
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: "#fff4e6" }}
                          >
                            <span className="text-orange-600 text-xs">⏳</span>
                          </div>
                          <span className="text-orange-600 font-medium">
                            รอชำระเงิน - จองไว้ชั่วคราว
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: "#ffe4e1" }}
                          >
                            <span className="text-red-600 text-xs">✕</span>
                          </div>
                          <span className="text-red-600 font-medium">
                            จองแล้ว - ไม่สามารถจองได้
                          </span>
                        </div>
                      </div>
                    </div>
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
                  className="bg-red-600 hover:bg-red-700"
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
                    <div className="space-y-4">
                      {equipment.map((item) => (
                        <Card key={item.equipment_id} size="small">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">
                                {item.equipment_name}
                              </p>
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
                                onChange={(value) =>
                                  handleEquipmentChange(
                                    item.equipment_id,
                                    value
                                  )
                                }
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
                  <Button size="large" onClick={() => setCurrentStep(0)} block>
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
                      <span className="text-2xl font-bold text-red-600">
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
                    onClick={confirmBooking}
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
    </>
  );
};

export default BookingForm;