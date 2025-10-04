import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// ดึงการจองทั้งหมด
export const getAllBookings = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
    
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
    
    // ถ้าไม่ใช่ admin ให้ดูแค่ของตัวเองเท่านั้น
    if (!isAdmin) {
      sql += ' AND b.user_id = ?';
      params.push(req.user.user_id);
    } else if (userId) {
      sql += ' AND b.user_id = ?';
      params.push(userId);
    }
    
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    const bookings = await query(sql, params);
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      error: error.message
    });
  }
};

// ดึงการจองตาม ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
    
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
    
    // ถ้าไม่ใช่ admin ต้องเป็นการจองของตัวเองเท่านั้น
    if (!isAdmin) {
      sql += ' AND b.user_id = ?';
      params.push(req.user.user_id);
    }
    
    const bookings = await query(sql, params);
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }
    
    // ดึงอุปกรณ์ที่จอง
    const equipment = await query(`
      SELECT 
        be.*,
        e.equipment_name
      FROM booking_equipment be
      LEFT JOIN equipment e ON be.equipment_id = e.equipment_id
      WHERE be.booking_id = ?
    `, [id]);
    
    const booking = {
      ...bookings[0],
      equipment
    };
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
      error: error.message
    });
  }
};

// ตรวจสอบว่าคอร์ทว่างหรือไม่
export const checkAvailability = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime } = req.query;
    
    if (!courtId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลให้ครบถ้วน'
      });
    }
    
    // ตรวจสอบการจองที่ซ้อนทับกัน
    const conflictBookings = await query(`
      SELECT * FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('pending', 'confirmed', 'paid')
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `, [courtId, date, endTime, startTime, endTime, endTime, startTime, endTime]);
    
    const isAvailable = conflictBookings.length === 0;
    
    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflictCount: conflictBookings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความพร้อม',
      error: error.message
    });
  }
};

// สร้างการจองใหม่
export const createBooking = async (req, res) => {
  try {
    const {
      venue_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      equipment = []
    } = req.body;
    
    const user_id = req.user.user_id;
    
    if (!venue_id || !court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    // ตรวจสอบว่าคอร์ทว่างหรือไม่
    const conflictBookings = await query(`
      SELECT * FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status IN ('pending', 'confirmed', 'paid')
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `, [court_id, booking_date, end_time, start_time, end_time, end_time, start_time, end_time]);
    
    if (conflictBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ช่วงเวลานี้ถูกจองแล้ว'
      });
    }
    
    const result = await transaction(async (conn) => {
      // ดึงราคาคอร์ท
      const [courts] = await conn.execute(
        'SELECT hourly_rate FROM courts WHERE court_id = ?',
        [court_id]
      );
      
      if (courts.length === 0) {
        throw new Error('ไม่พบคอร์ทที่ต้องการ');
      }
      
      // คำนวณจำนวนชั่วโมง
      const startHour = parseInt(start_time.split(':')[0]);
      const endHour = parseInt(end_time.split(':')[0]);
      const hours = endHour - startHour;
      
      let total_price = courts[0].hourly_rate * hours;
      
      // สร้างการจอง
      const [bookingResult] = await conn.execute(`
        INSERT INTO bookings 
        (user_id, venue_id, court_id, booking_date, start_time, end_time, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [user_id, venue_id, court_id, booking_date, start_time, end_time, total_price]);
      
      const bookingId = bookingResult.insertId;
      
      // เพิ่มอุปกรณ์ (ถ้ามี)
      if (equipment.length > 0) {
        for (const item of equipment) {
          const [equipmentData] = await conn.execute(
            'SELECT rental_price, stock FROM equipment WHERE equipment_id = ?',
            [item.equipment_id]
          );
          
          if (equipmentData.length === 0 || equipmentData[0].stock < item.quantity) {
            throw new Error('อุปกรณ์ไม่เพียงพอ');
          }
          
          const equipmentPrice = equipmentData[0].rental_price * item.quantity;
          total_price += equipmentPrice;
          
          await conn.execute(`
            INSERT INTO booking_equipment (booking_id, equipment_id, quantity, price)
            VALUES (?, ?, ?, ?)
          `, [bookingId, item.equipment_id, item.quantity, equipmentPrice]);
          
          // ลดจำนวน stock
          await conn.execute(
            'UPDATE equipment SET stock = stock - ? WHERE equipment_id = ?',
            [item.quantity, item.equipment_id]
          );
        }
        
        // Update total_price
        await conn.execute(
          'UPDATE bookings SET total_price = ? WHERE booking_id = ?',
          [total_price, bookingId]
        );
      }
      
      // สร้าง time slot
      await conn.execute(`
        INSERT INTO court_time_slots 
        (court_id, slot_date, start_time, end_time, status, booking_id)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `, [court_id, booking_date, start_time, end_time, bookingId]);
      
      return { bookingId, total_price };
    });
    
    // Log activity
    await logActivity(user_id, 'CREATE_BOOKING', 'bookings', result.bookingId);
    
    // สร้างการแจ้งเตือน
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [
      user_id,
      'จองสนามสำเร็จ',
      `การจองของคุณได้ถูกสร้างแล้ว รหัสการจอง: ${result.bookingId}`,
      'booking'
    ]);
    
    res.status(201).json({
      success: true,
      message: 'จองสำเร็จ',
      data: {
        bookingId: result.bookingId,
        totalPrice: result.total_price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการจอง',
      error: error.message
    });
  }
};

// ยกเลิกการจอง
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
    
    // ตรวจสอบสิทธิ์
    let bookings;
    if (isAdmin) {
      bookings = await query(
        'SELECT * FROM bookings WHERE booking_id = ?',
        [id]
      );
    } else {
      bookings = await query(
        'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
        [id, req.user.user_id]
      );
    }
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }
    
    const booking = bookings[0];
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'การจองนี้ถูกยกเลิกแล้ว'
      });
    }
    
    await transaction(async (conn) => {
      // Update booking status
      await conn.execute(`
        UPDATE bookings 
        SET status = 'cancelled', 
            cancellation_reason = ?,
            cancelled_at = NOW()
        WHERE booking_id = ?
      `, [cancellation_reason, id]);
      
      // คืน stock อุปกรณ์
      const equipment = await conn.execute(
        'SELECT equipment_id, quantity FROM booking_equipment WHERE booking_id = ?',
        [id]
      );
      
      for (const item of equipment[0]) {
        await conn.execute(
          'UPDATE equipment SET stock = stock + ? WHERE equipment_id = ?',
          [item.quantity, item.equipment_id]
        );
      }
      
      // Update time slot
      await conn.execute(
        'UPDATE court_time_slots SET status = "available", booking_id = NULL WHERE booking_id = ?',
        [id]
      );
    });
    
    // Log activity
    await logActivity(req.user.user_id, 'CANCEL_BOOKING', 'bookings', id);
    
    // สร้างการแจ้งเตือน
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [
      booking.user_id,
      'ยกเลิกการจอง',
      `การจอง #${id} ได้ถูกยกเลิกแล้ว`,
      'booking'
    ]);
    
    res.json({
      success: true,
      message: 'ยกเลิกการจองสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
      error: error.message
    });
  }
};

// อัพเดทสถานะการจอง (สำหรับ admin/manager)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'paid'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }
    
    await query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, id]
    );
    
    // Log activity
    await logActivity(req.user.user_id, 'UPDATE_BOOKING_STATUS', 'bookings', id);
    
    res.json({
      success: true,
      message: 'อัพเดทสถานะสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ',
      error: error.message
    });
  }
};