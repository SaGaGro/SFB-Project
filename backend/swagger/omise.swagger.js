/**
 * @swagger
 * /api/omise/create-charge:
 *   post:
 *     tags: [Omise]
 *     summary: สร้าง Omise Charge (QR PromptPay) (Member only)
 *     description: |
 *       สร้าง QR Code สำหรับชำระเงินผ่าน PromptPay
 *       
 *       **สิทธิ์การเข้าถึง:** 
 *       - ❌ Owner
 *       - ❌ Manager
 *       - ✅ Member (สำหรับการจองของตัวเอง)
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
 *                 description: ID ของการจอง
 *     responses:
 *       201:
 *         description: สร้าง QR Code สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: สร้าง QR Code สำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking_id:
 *                       type: integer
 *                       example: 1
 *                     charge_id:
 *                       type: string
 *                       example: chrg_test_5xtsrzku73y6c1e14w9
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                       example: 1000.00
 *                     qr_code_url:
 *                       type: string
 *                       example: https://api.omise.co/charges/chrg_test_xxx/documents/docu_test_xxx/downloads/png
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-12-25T10:30:00Z'
 *       400:
 *         description: การจองถูกชำระเงินแล้วหรือถูกยกเลิก
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ไม่พบการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/omise/charge/{charge_id}:
 *   get:
 *     tags: [Omise]
 *     summary: ตรวจสอบสถานะ Charge (All authenticated users)
 *     description: |
 *       ตรวจสอบสถานะการชำระเงินจาก Omise
 *       
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (ตรวจสอบได้ทุกรายการ)
 *       - ✅ Manager (ตรวจสอบได้ทุกรายการ)
 *       - ✅ Member (ตรวจสอบได้เฉพาะรายการของตัวเอง)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: charge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charge ID จาก Omise
 *         example: chrg_test_5xtsrzku73y6c1e14w9
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment_id:
 *                       type: integer
 *                       example: 1
 *                     booking_id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [pending, successful, failed, expired]
 *                       example: successful
 *                     paid:
 *                       type: boolean
 *                       example: true
 *                     amount:
 *                       type: number
 *                       example: 1000.00
 *                     omise_status:
 *                       type: string
 *                       example: successful
 *       404:
 *         description: ไม่พบข้อมูลการชำระเงิน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/omise/webhook:
 *   post:
 *     tags: [Omise]
 *     summary: Webhook สำหรับ Omise (Public - No Auth)
 *     description: |
 *       รับ event จาก Omise เมื่อมีการชำระเงินสำเร็จหรือล้มเหลว
 *       
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Public (ไม่ต้อง authenticate - ใช้สำหรับ Omise Webhook)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: charge.complete
 *               data:
 *                 type: object
 *                 description: Charge object จาก Omise
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Webhook processing failed
 */