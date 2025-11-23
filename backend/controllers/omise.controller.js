import { query, transaction } from '../config/database.js';
import { createOmiseCharge, getOmiseCharge } from '../utils/omise.js';
import { logActivity } from '../utils/logger.js';

export const createPaymentCharge = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const user_id = req.user.user_id;

    console.log('🔄 Creating Omise charge for booking:', booking_id);

    // ดึงข้อมูลการจอง
    const bookings = await query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [booking_id, user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองที่ต้องการ',
      });
    }

    const booking = bookings[0];

    if (booking.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'การจองนี้ชำระเงินแล้ว',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถชำระเงินสำหรับการจองที่ถูกยกเลิก',
      });
    }

    // สร้าง Omise Charge
    const chargeResult = await createOmiseCharge(
      parseFloat(booking.total_price),
      `การจองคอร์ท #${booking_id}`,
      {
        booking_id: booking_id,
        user_id: user_id,
      }
    );

    console.log('✅ Omise charge created:', chargeResult.charge_id);

    // บันทึกข้อมูลการชำระเงิน
    await transaction(async (conn) => {
      // ตรวจสอบว่ามี payment อยู่แล้วหรือไม่
      const [existingPayments] = await conn.execute(
        'SELECT payment_id FROM payments WHERE booking_id = ?',
        [booking_id]
      );

      if (existingPayments.length > 0) {
        // Update existing payment
        await conn.execute(
          `UPDATE payments 
           SET omise_charge_id = ?, 
               qr_code = ?, 
               status = 'pending',
               updated_at = NOW()
           WHERE booking_id = ?`,
          [chargeResult.charge_id, chargeResult.scannable_code.image.download_uri, booking_id]
        );
      } else {
        // Insert new payment
        await conn.execute(
          `INSERT INTO payments 
           (booking_id, user_id, amount, method, status, omise_charge_id, qr_code)
           VALUES (?, ?, ?, 'omise', 'pending', ?, ?)`,
          [
            booking_id,
            user_id,
            booking.total_price,
            chargeResult.charge_id,
            chargeResult.scannable_code.image.download_uri,
          ]
        );
      }
    });

    await logActivity(user_id, 'CREATE_OMISE_CHARGE', 'payments', booking_id);

    res.status(201).json({
      success: true,
      message: 'สร้าง QR Code สำเร็จ',
      data: {
        booking_id: booking_id,
        charge_id: chargeResult.charge_id,
        amount: booking.total_price,
        qr_code_url: chargeResult.scannable_code.image.download_uri,
        expires_at: chargeResult.charge.expires_at,
      },
    });
  } catch (error) {
    console.error('❌ Create payment charge error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน',
    });
  }
};

export const checkChargeStatus = async (req, res) => {
  try {
    const { charge_id } = req.params;

    console.log('🔍 Checking charge status:', charge_id);

    const result = await getOmiseCharge(charge_id);
    const charge = result.charge;

    // ดึงข้อมูล payment
    const payments = await query(
      'SELECT * FROM payments WHERE omise_charge_id = ?',
      [charge_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการชำระเงิน',
      });
    }

    const payment = payments[0];

    res.json({
      success: true,
      data: {
        payment_id: payment.payment_id,
        booking_id: payment.booking_id,
        status: charge.status,
        paid: charge.paid,
        amount: charge.amount / 100,
        omise_status: charge.status,
      },
    });
  } catch (error) {
    console.error('❌ Check charge status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ',
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('📥 Webhook received:', event.key);

    const charge = event.data;

    if (event.key === 'charge.complete') {
      if (charge.paid && charge.status === 'successful') {
        // Payment สำเร็จ
        await transaction(async (conn) => {
          await conn.execute(
            `UPDATE payments 
             SET status = 'paid', 
                 paid_at = NOW(),
                 updated_at = NOW()
             WHERE omise_charge_id = ?`,
            [charge.id]
          );

          const [payments] = await conn.execute(
            'SELECT booking_id, user_id FROM payments WHERE omise_charge_id = ?',
            [charge.id]
          );

          if (payments.length > 0) {
            const payment = payments[0];

            await conn.execute(
              'UPDATE bookings SET status = "paid" WHERE booking_id = ?',
              [payment.booking_id]
            );

            await conn.execute(
              'UPDATE court_time_slots SET status = "booked" WHERE booking_id = ?',
              [payment.booking_id]
            );

            await conn.execute(
              `INSERT INTO notifications (user_id, title, message, type)
               VALUES (?, ?, ?, ?)`,
              [
                payment.user_id,
                'ชำระเงินสำเร็จ',
                `การชำระเงินสำหรับการจอง #${payment.booking_id} สำเร็จแล้ว`,
                'payment',
              ]
            );
          }
        });
      }
    } 
    else if (event.key === 'charge.failed' || event.key === 'charge.expired') {
      // Payment ล้มเหลวหรือหมดอายุ
      await transaction(async (conn) => {
        await conn.execute(
          `UPDATE payments 
           SET status = 'cancelled',
               updated_at = NOW()
           WHERE omise_charge_id = ?`,
          [charge.id]
        );

        const [payments] = await conn.execute(
          'SELECT booking_id, user_id FROM payments WHERE omise_charge_id = ?',
          [charge.id]
        );

        if (payments.length > 0) {
          const payment = payments[0];

          await conn.execute(
            'UPDATE bookings SET status = "cancelled" WHERE booking_id = ?',
            [payment.booking_id]
          );

          await conn.execute(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, ?, ?, ?)`,
            [
              payment.user_id,
              'ชำระเงินไม่สำเร็จ',
              `การชำระเงินสำหรับการจอง #${payment.booking_id} ถูกยกเลิก`,
              'payment',
            ]
          );
        }
      });

      console.log(`❌ Payment cancelled for charge: ${charge.id}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
