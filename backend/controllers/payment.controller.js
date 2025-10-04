import { query, transaction } from '../config/database.js';
import { logActivity } from '../utils/logger.js';

// สร้างการชำระเงิน
export const createPayment = async (req, res) => {
  try {
    const { booking_id, method = 'qr', qr_code } = req.body;
    const user_id = req.user.user_id;
    
    // ตรวจสอบการจอง
    const bookings = await query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ'
      });
    }
    
    const booking = bookings[0];
    
    if (booking.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'การจองนี้ชำระเงินแล้ว'
      });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถชำระเงินสำหรับการจองที่ถูกยกเลิก'
      });
    }
    
    // สร้างการชำระเงิน
    const result = await query(`
      INSERT INTO payments (booking_id, user_id, amount, method, qr_code, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [booking_id, user_id, booking.total_price, method, qr_code]);
    
    // Log activity
    await logActivity(user_id, 'CREATE_PAYMENT', 'payments', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'สร้างการชำระเงินสำเร็จ',
      data: {
        paymentId: result.insertId,
        amount: booking.total_price,
        method
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน',
      error: error.message
    });
  }
};

// ยืนยันการชำระเงิน (สำหรับ admin/manager)
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await transaction(async (conn) => {
      // Update payment status
      await conn.execute(`
        UPDATE payments 
        SET status = 'paid', paid_at = NOW()
        WHERE payment_id = ?
      `, [id]);
      
      // ดึงข้อมูล payment
      const [payments] = await conn.execute(
        'SELECT booking_id, user_id FROM payments WHERE payment_id = ?',
        [id]
      );
      
      if (payments.length === 0) {
        throw new Error('ไม่พบข้อมูลการชำระเงิน');
      }
      
      const payment = payments[0];
      
      // Update booking status
      await conn.execute(
        'UPDATE bookings SET status = "paid" WHERE booking_id = ?',
        [payment.booking_id]
      );
      
      // Update time slot
      await conn.execute(
        'UPDATE court_time_slots SET status = "booked" WHERE booking_id = ?',
        [payment.booking_id]
      );
      
      // สร้างการแจ้งเตือน
      await conn.execute(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `, [
        payment.user_id,
        'ชำระเงินสำเร็จ',
        `การชำระเงินสำหรับการจอง #${payment.booking_id} สำเร็จแล้ว`,
        'payment'
      ]);
    });
    
    // Log activity
    await logActivity(req.user.user_id, 'CONFIRM_PAYMENT', 'payments', id);
    
    res.json({
      success: true,
      message: 'ยืนยันการชำระเงินสำเร็จ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน',
      error: error.message
    });
  }
};

// ดึงประวัติการชำระเงิน
export const getPayments = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
    
    let sql = `
      SELECT 
        p.*,
        b.booking_date,
        b.start_time,
        b.end_time,
        u.username,
        u.email,
        v.venue_name,
        c.court_name
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN courts c ON b.court_id = c.court_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (!isAdmin) {
      sql += ' AND p.user_id = ?';
      params.push(req.user.user_id);
    } else if (userId) {
      sql += ' AND p.user_id = ?';
      params.push(userId);
    }
    
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const payments = await query(sql, params);
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      error: error.message
    });
  }
};

// ดึงการชำระเงินตาม ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
    
    let sql = `
      SELECT 
        p.*,
        b.*,
        u.username,
        u.email,
        v.venue_name,
        c.court_name
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN courts c ON b.court_id = c.court_id
      WHERE p.payment_id = ?
    `;
    
    const params = [id];
    
    if (!isAdmin) {
      sql += ' AND p.user_id = ?';
      params.push(req.user.user_id);
    }
    
    const payments = await query(sql, params);
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการชำระเงิน'
      });
    }
    
    res.json({
      success: true,
      data: payments[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      error: error.message
    });
  }
};