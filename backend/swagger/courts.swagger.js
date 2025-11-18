/**
 * @swagger
 * /api/courts:
 *   get:
 *     tags: [Courts]
 *     summary: ดึงรายการคอร์ททั้งหมด
 *     parameters:
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: integer
 *         description: กรองตาม venue ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, maintenance, unavailable]
 *         description: กรองตามสถานะ
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
 *                     $ref: '#/components/schemas/Court'
 *   post:
 *     tags: [Courts]
 *     summary: สร้างคอร์ทใหม่ (Owner only)
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
 *               - court_name
 *               - hourly_rate
 *             properties:
 *               venue_id:
 *                 type: integer
 *                 example: 1
 *               court_name:
 *                 type: string
 *                 example: สนาม A
 *               hourly_rate:
 *                 type: number
 *                 format: decimal
 *                 example: 500.00
 *               capacity:
 *                 type: integer
 *                 example: 22
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['/uploads/courts/court1.jpg']
 *     responses:
 *       201:
 *         description: สร้างคอร์ทสำเร็จ
 *
 * /api/courts/available-slots:
 *   get:
 *     tags: [Courts]
 *     summary: ดึง Time Slots ที่ว่าง
 *     parameters:
 *       - in: query
 *         name: courtId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Court ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: วันที่ต้องการเช็ค (YYYY-MM-DD)
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     opening_time:
 *                       type: string
 *                       example: '06:00:00'
 *                     closing_time:
 *                       type: string
 *                       example: '22:00:00'
 *                     booked_slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start_time:
 *                             type: string
 *                             example: '09:00:00'
 *                           end_time:
 *                             type: string
 *                             example: '11:00:00'
 *
 * /api/courts/{id}:
 *   get:
 *     tags: [Courts]
 *     summary: ดึงข้อมูลคอร์ทตาม ID
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
 *                   $ref: '#/components/schemas/Court'
 *   put:
 *     tags: [Courts]
 *     summary: แก้ไขข้อมูลคอร์ท (Owner/Manager only)
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
 *               court_name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, maintenance, unavailable]
 *               hourly_rate:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 */