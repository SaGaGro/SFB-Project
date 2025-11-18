/**
 * @swagger
 * /api/venues:
 *   get:
 *     tags: [Venues]
 *     summary: ดึงรายการสนามทั้งหมด (Public)
 *     description: |
 *       ดึงรายการสนามทั้งหมด (Public เห็นเฉพาะ is_active = 1)
 *       
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Public (ไม่ต้อง login)
 *       - ✅ Owner (ดูได้ทั้ง active และ inactive)
 *       - ✅ Manager (ดูได้ทั้ง active และ inactive)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [football, basketball, badminton, tennis]
 *         description: ประเภทสนาม
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: กรองตามสถานะ (Owner/Manager only)
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
 *                     $ref: '#/components/schemas/Venue'
 *   post:
 *     tags: [Venues]
 *     summary: สร้างสนามใหม่ (Owner only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ❌ Manager
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
 *               - venue_name
 *               - venue_type
 *             properties:
 *               venue_name:
 *                 type: string
 *                 example: สนามกีฬาแห่งชาติ
 *               venue_type:
 *                 type: string
 *                 enum: [football, basketball, badminton, tennis]
 *                 example: football
 *               location:
 *                 type: string
 *                 example: กรุงเทพมหานคร
 *               description:
 *                 type: string
 *                 example: สนามฟุตบอลมาตรฐาน FIFA
 *               opening_time:
 *                 type: string
 *                 example: '06:00:00'
 *               closing_time:
 *                 type: string
 *                 example: '22:00:00'
 *               is_active:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['/uploads/venues/venue1.jpg']
 *     responses:
 *       201:
 *         description: สร้างสนามสำเร็จ
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
 *                     venueId:
 *                       type: integer
 *
 * /api/venues/{id}:
 *   get:
 *     tags: [Venues]
 *     summary: ดึงข้อมูลสนามตาม ID (Public)
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
 *                   allOf:
 *                     - $ref: '#/components/schemas/Venue'
 *                     - type: object
 *                       properties:
 *                         courts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Court'
 *                         equipment:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Equipment'
 *   put:
 *     tags: [Venues]
 *     summary: แก้ไขข้อมูลสนาม (Owner/Manager only)
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
 *               venue_name:
 *                 type: string
 *               venue_type:
 *                 type: string
 *                 enum: [football, basketball, badminton, tennis]
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               opening_time:
 *                 type: string
 *               closing_time:
 *                 type: string
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
 * 
 * /api/venues/{id}/toggle:
 *   patch:
 *     tags: [Venues]
 *     summary: เปิด/ปิดการใช้งานสนาม (Owner/Manager only)
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