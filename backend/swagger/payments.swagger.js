/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: ดึงรายการการชำระเงินทั้งหมด
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: กรองตาม user ID (Owner/Manager only)
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
 *                     $ref: '#/components/schemas/Payment'
 *   post:
 *     tags: [Payments]
 *     summary: สร้างการชำระเงิน
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: integer
 *                 example: 1
 *               method:
 *                 type: string
 *                 enum: [qr, omise]
 *                 default: qr
 *               qr_code:
 *                 type: string
 *                 description: URL ของ QR Code (ถ้าใช้ method=qr)
 *     responses:
 *       201:
 *         description: สร้างการชำระเงินสำเร็จ
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
 *                     paymentId:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     method:
 *                       type: string
 *
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: ดึงข้อมูลการชำระเงินตาม ID
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
 *                   $ref: '#/components/schemas/Payment'
 *
 * /api/payments/{id}/confirm:
 *   put:
 *     tags: [Payments]
 *     summary: ยืนยันการชำระเงิน (Owner/Manager only)
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
 *         description: ยืนยันการชำระเงินสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: ยืนยันการชำระเงินสำเร็จ
 */