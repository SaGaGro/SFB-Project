/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: ดึงรายการการจองทั้งหมด
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, paid, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: กรองตาม user ID (Owner/Manager only)
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: courtId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         example: '2024-12-25'
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *   post:
 *     tags: [Bookings]
 *     summary: สร้างการจองใหม่
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venue_id
 *               - court_id
 *               - booking_date
 *               - start_time
 *               - end_time
 *             properties:
 *               venue_id:
 *                 type: integer
 *                 example: 1
 *               court_id:
 *                 type: integer
 *                 example: 1
 *               booking_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-12-25'
 *               start_time:
 *                 type: string
 *                 example: '09:00:00'
 *               end_time:
 *                 type: string
 *                 example: '11:00:00'
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     equipment_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                 example:
 *                   - equipment_id: 1
 *                     quantity: 2
 *     responses:
 *       201:
 *         description: จองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                     total_price:
 *                       type: number
 *
 * /api/bookings/check-availability:
 *   get:
 *     tags: [Bookings]
 *     summary: ตรวจสอบความพร้อม
 *     parameters:
 *       - in: query
 *         name: courtId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: '2024-12-25'
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *         example: '09:00:00'
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *         example: '11:00:00'
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *
 * /api/bookings/booked-slots:
 *   get:
 *     tags: [Bookings]
 *     summary: ดึงช่วงเวลาที่ถูกจองแล้ว
 *     parameters:
 *       - in: query
 *         name: courtId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: '2024-12-25'
 *     responses:
 *       200:
 *         description: สำเร็จ
 *
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: ดึงข้อมูลการจองตาม ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *   put:
 *     tags: [Bookings]
 *     summary: แก้ไขการจอง (Owner/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *
 * /api/bookings/{id}/cancel:
 *   put:
 *     tags: [Bookings]
 *     summary: ยกเลิกการจอง
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 example: เปลี่ยนใจ
 *     responses:
 *       200:
 *         description: ยกเลิกสำเร็จ
 *
 * /api/bookings/{id}/status:
 *   put:
 *     tags: [Bookings]
 *     summary: เปลี่ยนสถานะการจอง (Owner/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, paid, cancelled]
 *     responses:
 *       200:
 *         description: เปลี่ยนสถานะสำเร็จ
 *
 * /api/bookings/{id}/payment-status:
 *   get:
 *     tags: [Bookings]
 *     summary: ตรวจสอบสถานะการชำระเงิน
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: สำเร็จ
 *
 * /api/bookings/{id}/confirm-payment:
 *   post:
 *     tags: [Bookings]
 *     summary: ยืนยันการชำระเงินด้วยตนเอง (Owner/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ยืนยันสำเร็จ
 */