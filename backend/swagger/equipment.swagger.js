/**
 * @swagger
 * /api/equipment:
 *   get:
 *     tags: [Equipment]
 *     summary: ดึงรายการอุปกรณ์ทั้งหมด (Public)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Public (ไม่ต้อง login)
 *     parameters:
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: integer
 *         description: กรองตาม venue ID
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
 *                     $ref: '#/components/schemas/Equipment'
 *   post:
 *     tags: [Equipment]
 *     summary: สร้างอุปกรณ์ใหม่ (Owner/Manager only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ✅ Manager
 *       - ❌ Member
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
 *               - equipment_name
 *               - stock
 *               - rental_price
 *             properties:
 *               venue_id:
 *                 type: integer
 *                 example: 1
 *               equipment_name:
 *                 type: string
 *                 example: ลูกฟุตบอล
 *               stock:
 *                 type: integer
 *                 example: 20
 *               rental_price:
 *                 type: number
 *                 format: decimal
 *                 example: 50.00
 *               is_active:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['/uploads/equipment/eq1.jpg']
 *     responses:
 *       201:
 *         description: สร้างอุปกรณ์สำเร็จ
 *
 * /api/equipment/{id}:
 *   get:
 *     tags: [Equipment]
 *     summary: ดึงข้อมูลอุปกรณ์ตาม ID (Public)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Public (ไม่ต้อง login)
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
 *                   $ref: '#/components/schemas/Equipment'
 *   put:
 *     tags: [Equipment]
 *     summary: แก้ไขข้อมูลอุปกรณ์ (Owner/Manager only)
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipment_name:
 *                 type: string
 *               stock:
 *                 type: integer
 *               rental_price:
 *                 type: number
 *               is_active:
 *                 type: integer
 *                 enum: [0, 1]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 * /api/equipment/{id}/toggle:
 *   patch:
 *     tags: [Equipment]
 *     summary: เปิด/ปิดการใช้งานอุปกรณ์ (Owner/Manager only)
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
 *         description: เปลี่ยนสถานะสำเร็จ
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
 *                     is_active:
 *                       type: integer
 */