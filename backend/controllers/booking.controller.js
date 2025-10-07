import { query, transaction } from "../config/database.js";
import { logActivity } from "../utils/logger.js";
import {
  generatePromptPayQR,
  formatPromptPayPhone,
} from "../utils/promptpay.js";

export const getAllBookings = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const isAdmin = req.user.role === "admin" || req.user.role === "manager";

    let sql = `
      SELECT 
        b.*,
        u.username,
        u.email,
        v.venue_name,
        v.venue_type,
        c.court_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN courts c ON b.court_id = c.court_id
      WHERE 1=1
    `;

    const params = [];

    if (!isAdmin) {
      sql += " AND b.user_id = ?";
      params.push(req.user.user_id);
    } else if (userId) {
      sql += " AND b.user_id = ?";
      params.push(userId);
    }

    if (status) {
      sql += " AND b.status = ?";
      params.push(status);
    }

    sql += " ORDER BY b.created_at DESC";

    const bookings = await query(sql, params);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง",
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin" || req.user.role === "manager";

    let sql = `
      SELECT 
        b.*,
        u.username,
        u.email,
        u.phone,
        v.venue_name,
        v.venue_type,
        v.location,
        c.court_name,
        c.hourly_rate
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN courts c ON b.court_id = c.court_id
      WHERE b.booking_id = ?
    `;

    const params = [id];

    if (!isAdmin) {
      sql += " AND b.user_id = ?";
      params.push(req.user.user_id);
    }

    const bookings = await query(sql, params);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการจองที่ต้องการ",
      });
    }

    const equipment = await query(
      `
      SELECT 
        be.*,
        e.equipment_name
      FROM booking_equipment be
      LEFT JOIN equipment e ON be.equipment_id = e.equipment_id
      WHERE be.booking_id = ?
    `,
      [id]
    );

    const booking = {
      ...bookings[0],
      equipment,
    };

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง",
      error: error.message,
    });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime } = req.query;

    if (!courtId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลให้ครบถ้วน",
      });
    }

    const conflictBookings = await query(
      `
      SELECT * FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('pending', 'confirmed', 'paid')
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `,
      [courtId, date, endTime, startTime, endTime, endTime, startTime, endTime]
    );

    const isAvailable = conflictBookings.length === 0;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflictCount: conflictBookings.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบความพร้อม",
      error: error.message,
    });
  }
};

export const getBookedSlotsByDate = async (req, res) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ court_id และ date",
      });
    }

    const bookings = await query(
      `
      SELECT 
        booking_id,
        TIME_FORMAT(start_time, '%H:%i') as start_time,
        TIME_FORMAT(end_time, '%H:%i') as end_time,
        status
      FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('paid', 'confirmed', 'pending')
      ORDER BY start_time
    `,
      [courtId, date]
    );

    console.log("📅 Date:", date);
    console.log("🕒 Booked slots:", bookings);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      venue_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      equipment = [],
    } = req.body;

    const user_id = req.user.user_id;

    console.log("📝 Creating booking:", {
      venue_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      user_id,
    });

    if (!venue_id || !court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
    }

    const conflictBookings = await query(
      `
      SELECT * FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('pending', 'confirmed', 'paid')
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `,
      [
        court_id,
        booking_date,
        end_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ]
    );

    console.log(
      "🔍 Conflict check:",
      conflictBookings.length,
      "conflicts found"
    );

    if (conflictBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ช่วงเวลานี้ถูกจองแล้ว",
      });
    }

    const result = await transaction(async (conn) => {
      const [courts] = await conn.execute(
        "SELECT hourly_rate FROM courts WHERE court_id = ?",
        [court_id]
      );

      if (courts.length === 0) {
        throw new Error("ไม่พบคอร์ทที่ต้องการ");
      }

      const [startHour, startMin] = start_time.split(":").map(Number);
      const [endHour, endMin] = end_time.split(":").map(Number);
      const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;

      let total_price = courts[0].hourly_rate * hours;

      console.log("💰 Calculated:", {
        hours,
        hourly_rate: courts[0].hourly_rate,
        total_price,
      });

      const [bookingResult] = await conn.execute(
        `
        INSERT INTO bookings 
        (user_id, venue_id, court_id, booking_date, start_time, end_time, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
        [
          user_id,
          venue_id,
          court_id,
          booking_date,
          start_time,
          end_time,
          total_price,
        ]
      );

      const bookingId = bookingResult.insertId;

      console.log("✅ Booking created:", bookingId);

      if (equipment.length > 0) {
        for (const item of equipment) {
          const [equipmentData] = await conn.execute(
            "SELECT rental_price, stock FROM equipment WHERE equipment_id = ?",
            [item.equipment_id]
          );

          if (
            equipmentData.length === 0 ||
            equipmentData[0].stock < item.quantity
          ) {
            throw new Error("อุปกรณ์ไม่เพียงพอ");
          }

          const equipmentPrice = equipmentData[0].rental_price * item.quantity;
          total_price += equipmentPrice;

          await conn.execute(
            `
            INSERT INTO booking_equipment (booking_id, equipment_id, quantity, price)
            VALUES (?, ?, ?, ?)
          `,
            [bookingId, item.equipment_id, item.quantity, equipmentPrice]
          );

          await conn.execute(
            "UPDATE equipment SET stock = stock - ? WHERE equipment_id = ?",
            [item.quantity, item.equipment_id]
          );
        }

        await conn.execute(
          "UPDATE bookings SET total_price = ? WHERE booking_id = ?",
          [total_price, bookingId]
        );
      }

      await conn.execute(
        `
        INSERT INTO court_time_slots 
        (court_id, slot_date, start_time, end_time, status, booking_id)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `,
        [court_id, booking_date, start_time, end_time, bookingId]
      );

      const promptpayPhone = formatPromptPayPhone(process.env.PROMPTPAY_PHONE);
      console.log("📱 PromptPay Phone:", promptpayPhone);

      // เก็บแค่ข้อมูล PromptPay ไม่ต้องเก็บ QR Code
      const [paymentResult] = await conn.execute(
        `
  INSERT INTO payments (booking_id, user_id, amount, method, status, qr_code)
  VALUES (?, ?, ?, 'qr', 'pending', ?)
`,
        [bookingId, user_id, total_price, promptpayPhone]
      ); // เก็บแค่เบอร์โทร

      console.log("💳 Payment created:", paymentResult.insertId);

      return {
        bookingId,
        total_price,
        paymentId: paymentResult.insertId,
        promptpayPhone: promptpayPhone, // ส่ง phone กลับไป
      };

      console.log("💳 Payment created:", paymentResult.insertId);

      return {
        bookingId,
        total_price,
        paymentId: paymentResult.insertId,
        qrCode: qrCodeDataURL,
      };
    });

    await logActivity(user_id, "CREATE_BOOKING", "bookings", result.bookingId);

    await query(
      `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `,
      [
        user_id,
        "จองสนามสำเร็จ",
        `การจองของคุณได้ถูกสร้างแล้ว รหัสการจอง: ${result.bookingId} กรุณาชำระเงินภายใน 15 นาที`,
        "booking",
      ]
    );

    res.status(201).json({
      success: true,
      message: "จองสำเร็จ กรุณาชำระเงินภายใน 15 นาที",
      data: {
        bookingId: result.bookingId,
        totalPrice: result.total_price,
        paymentId: result.paymentId,
        qrCode: result.qrCode,
        deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการจอง",
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const isAdmin = req.user.role === "admin" || req.user.role === "manager";

    let bookings;
    if (isAdmin) {
      bookings = await query("SELECT * FROM bookings WHERE booking_id = ?", [
        id,
      ]);
    } else {
      bookings = await query(
        "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?",
        [id, req.user.user_id]
      );
    }

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการจองที่ต้องการ",
      });
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "การจองนี้ถูกยกเลิกแล้ว",
      });
    }

    await transaction(async (conn) => {
      await conn.execute(
        `
        UPDATE bookings 
        SET status = 'cancelled', 
            cancellation_reason = ?,
            cancelled_at = NOW()
        WHERE booking_id = ?
      `,
        [cancellation_reason, id]
      );

      const equipment = await conn.execute(
        "SELECT equipment_id, quantity FROM booking_equipment WHERE booking_id = ?",
        [id]
      );

      for (const item of equipment[0]) {
        await conn.execute(
          "UPDATE equipment SET stock = stock + ? WHERE equipment_id = ?",
          [item.quantity, item.equipment_id]
        );
      }

      await conn.execute(
        'UPDATE court_time_slots SET status = "available", booking_id = NULL WHERE booking_id = ?',
        [id]
      );

      await conn.execute(
        'UPDATE payments SET status = "failed" WHERE booking_id = ? AND status = "pending"',
        [id]
      );
    });

    await logActivity(req.user.user_id, "CANCEL_BOOKING", "bookings", id);

    await query(
      `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `,
      [
        booking.user_id,
        "ยกเลิกการจอง",
        `การจอง #${id} ได้ถูกยกเลิกแล้ว`,
        "booking",
      ]
    );

    res.json({
      success: true,
      message: "ยกเลิกการจองสำเร็จ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยกเลิกการจอง",
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "paid"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "สถานะไม่ถูกต้อง",
      });
    }

    await query("UPDATE bookings SET status = ? WHERE booking_id = ?", [
      status,
      id,
    ]);

    await logActivity(
      req.user.user_id,
      "UPDATE_BOOKING_STATUS",
      "bookings",
      id
    );

    res.json({
      success: true,
      message: "อัพเดทสถานะสำเร็จ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
      error: error.message,
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const payments = await query(
      `
      SELECT p.*, b.status as booking_status
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      WHERE p.booking_id = ? AND p.user_id = ?
    `,
      [id, user_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลการชำระเงิน",
      });
    }

    res.json({
      success: true,
      data: payments[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};
