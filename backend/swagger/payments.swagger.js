/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: ดึงรายการการชำระเงินทั้งหมด (All authenticated users)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (ดูได้ทุกรายการ)
 *       - ✅ Manager (ดูได้ทุกรายการ)
 *       - ✅ Member (ดูได้เฉพาะรายการของตัวเอง)
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
 * /api/payments/{id}/confirm:
 *   put:
 *     tags: [Payments]
 *     summary: ยืนยันการชำระเงิน (Owner/Manager only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ✅ Manager
 *       - ❌ Member
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