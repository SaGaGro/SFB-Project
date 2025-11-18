/**
 * @swagger
 * /api/users/me:
 *   put:
 *     tags: [Users]
 *     summary: แก้ไขโปรไฟล์ของตัวเอง (All authenticated users)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ✅ Manager  
 *       - ✅ Member
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               profile_image:
 *                 type: string
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *   delete:
 *     tags: [Users]
 *     summary: ลบบัญชีตัวเอง (All authenticated users)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ✅ Manager  
 *       - ✅ Member
 *       
 *       **หมายเหตุ:** เป็นการ Soft Delete (ไม่ลบจริง แต่ปิดการใช้งาน)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลบบัญชีสำเร็จ
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: ดึงรายการผู้ใช้ทั้งหมด (Owner/Manager only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (ดูได้ทุก role)
 *       - ✅ Manager (ดูได้เฉพาะ Member)
 *       - ❌ Member (ไม่สามารถเข้าถึง)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, member]
 *         description: กรองตาม role (Owner only)
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: กรองตามสถานะ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: ค้นหาจาก username หรือ email
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
 *                     $ref: '#/components/schemas/User'
 *
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: ดึงข้อมูลผู้ใช้ตาม ID (All authenticated users)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (ดูได้ทุกคน)
 *       - ✅ Manager (ดูได้ทุกคน)
 *       - ✅ Member (ดูได้ทุกคน)
 *       
 *       **หมายเหตุ:** แสดงข้อมูลพร้อมสถิติการจอง
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
 *                   $ref: '#/components/schemas/User'
 *   put:
 *     tags: [Users]
 *     summary: แก้ไขข้อมูลผู้ใช้ (Owner of account or Owner)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (แก้ไขได้ทุกคน)
 *       - ❌ Manager (ไม่สามารถแก้ไขคนอื่น)
 *       - ❌ Member (แก้ไขได้เฉพาะตัวเอง)
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
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               profile_image:
 *                 type: string
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *   delete:
 *     tags: [Users]
 *     summary: ลบผู้ใช้ (Owner/Manager only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (ลบได้ทุกคน ยกเว้นตัวเอง)
 *       - ✅ Manager (ลบได้เฉพาะ Member)
 *       - ❌ Member (ไม่สามารถเข้าถึง)
 *       
 *       **หมายเหตุ:** เป็นการ Soft Delete (ไม่ลบจริง แต่ปิดการใช้งาน)
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
 *         description: ลบสำเร็จ
 *
 * /api/users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: เปลี่ยน role ผู้ใช้ (Owner only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner
 *       - ❌ Manager
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, member]
 *                 example: manager
 *     responses:
 *       200:
 *         description: เปลี่ยน role สำเร็จ
 *
 * /api/users/{id}/reset-password:
 *   put:
 *     tags: [Users]
 *     summary: รีเซ็ตรหัสผ่านผู้ใช้ (Owner/Manager only)
 *     description: |
 *       **สิทธิ์การเข้าถึง:** 
 *       - ✅ Owner (รีเซ็ตได้ทุกคน)
 *       - ✅ Manager (รีเซ็ตได้เฉพาะ Member)
 *       - ❌ Member (ไม่สามารถเข้าถึง)
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
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: รีเซ็ตรหัสผ่านสำเร็จ
 */