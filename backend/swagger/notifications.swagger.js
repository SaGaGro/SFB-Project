/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: ดึงรายการการแจ้งเตือนของผู้ใช้
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [booking, payment, system]
 *         description: กรองตามประเภท
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: string
 *           enum: ['true', 'false', '1', '0']
 *         description: กรองตามสถานะการอ่าน
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: จำนวนการแจ้งเตือนที่ต้องการ
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
 *                   example: 10
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *   post:
 *     tags: [Notifications]
 *     summary: สร้างการแจ้งเตือน (Owner/Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *               - message
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: แจ้งเตือนจากระบบ
 *               message:
 *                 type: string
 *                 example: ข้อความแจ้งเตือน
 *               type:
 *                 type: string
 *                 enum: [booking, payment, system]
 *                 default: system
 *     responses:
 *       201:
 *         description: สร้างการแจ้งเตือนสำเร็จ
 *
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: ทำเครื่องหมายว่าอ่านแล้ว
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
 *         description: อ่านการแจ้งเตือนแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: อ่านการแจ้งเตือนแล้ว
 *
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: อ่านทั้งหมด
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: อ่านการแจ้งเตือนทั้งหมดแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: อ่านการแจ้งเตือนทั้งหมดแล้ว
 *
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: ลบการแจ้งเตือน (Soft Delete)
 *     description: ซ่อนการแจ้งเตือน (ไม่ลบจริง)
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
 *         description: ซ่อนการแจ้งเตือนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: ซ่อนการแจ้งเตือนสำเร็จ
 */