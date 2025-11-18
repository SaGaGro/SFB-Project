/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     tags: [Uploads]
 *     summary: อัปโหลดรูปโปรไฟล์
 *     description: อัปโหลดรูปโปรไฟล์และบันทึกลง database ทันที
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile
 *             properties:
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปภาพ (jpg, jpeg, png, gif)
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: อัปโหลดรูปโปรไฟล์สำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: /uploads/profiles/user1.jpg
 *                     fullUrl:
 *                       type: string
 *                       example: http://localhost:3000/uploads/profiles/user1.jpg
 *
 * /api/upload/venue:
 *   post:
 *     tags: [Uploads]
 *     summary: อัปโหลดรูปสนาม (Owner/Manager only)
 *     description: อัปโหลดรูปสนามได้หลายรูป (สูงสุด 10 รูป)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - venueImages
 *             properties:
 *               venueImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               venueId:
 *                 type: integer
 *                 description: Venue ID (ถ้ามี จะบันทึกลง database)
 *                 example: 1
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: อัพโหลดรูปสนามสำเร็จ 3 รูป
 *                 data:
 *                   type: object
 *                   properties:
 *                     venueId:
 *                       type: integer
 *                       nullable: true
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['/uploads/venues/venue1.jpg']
 *                     count:
 *                       type: integer
 *                       example: 3
 *
 * /api/upload/court:
 *   post:
 *     tags: [Uploads]
 *     summary: อัปโหลดรูปคอร์ท (Owner/Manager only)
 *     description: อัปโหลดรูปคอร์ทได้หลายรูป (สูงสุด 10 รูป)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courtImages
 *             properties:
 *               courtImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               courtId:
 *                 type: integer
 *                 description: Court ID (ถ้ามี จะบันทึกลง database)
 *                 example: 1
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
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
 *                     courtId:
 *                       type: integer
 *                       nullable: true
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     count:
 *                       type: integer
 *
 * /api/upload/equipment:
 *   post:
 *     tags: [Uploads]
 *     summary: อัปโหลดรูปอุปกรณ์ (Owner/Manager only)
 *     description: อัปโหลดรูปอุปกรณ์ได้หลายรูป (สูงสุด 10 รูป)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - equipmentImages
 *               - equipmentId
 *             properties:
 *               equipmentImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               equipmentId:
 *                 type: integer
 *                 description: Equipment ID (บังคับ)
 *                 example: 1
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 *       400:
 *         description: กรุณาระบุ equipment_id
 *       404:
 *         description: ไม่พบอุปกรณ์ที่ต้องการ
 *
 * /api/upload/{type}/{id}:
 *   delete:
 *     tags: [Uploads]
 *     summary: ลบรูปภาพ (Owner/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [venue, court, equipment]
 *         description: ประเภทของรูป
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *     responses:
 *       200:
 *         description: ลบรูปภาพสำเร็จ
 *       404:
 *         description: ไม่พบรูปภาพ
 */