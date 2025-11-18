import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sport Booking System API',
      version: '1.0.0',
      description: `
#  ระบบจองสนามกีฬาออนไลน์

API Documentation ฉบับสมบูรณ์สำหรับระบบจองสนามกีฬาออนไลน์ที่ครอบคลุมการทำงานทุกส่วน

## ✨ คุณสมบัติหลัก

- **🔐 ระบบ Authentication** - ระบบล็อกอิน/ลงทะเบียนที่ปลอดภัยด้วย JWT Token
- **👥 จัดการผู้ใช้** - รองรับ 3 บทบาท (Owner, Manager, Member)
- **🏟️ จัดการสนาม** - ครอบคลุมสนามกีฬาหลากหลายประเภท
- **📅 ระบบจอง** - จองสนามแบบเรียลไทม์พร้อมตรวจสอบความขัดแย้ง
- **💳 ชำระเงิน** - เชื่อมต่อ Omise Payment Gateway (รองรับ QR Code)
- **🔔 การแจ้งเตือน** - แจ้งเตือนสถานะการจองและการชำระเงิน
- **📁 อัปโหลดไฟล์** - รองรับการอัปโหลดรูปภาพสำหรับโปรไฟล์และสนาม

## 🚀 การเริ่มต้นใช้งาน

### Authentication
1. ลงทะเบียนผ่าน \`POST /api/auth/register\`
2. เข้าสู่ระบบผ่าน \`POST /api/auth/login\` เพื่อรับ JWT Token
3. ใส่ Token ใน Header: \`Authorization: Bearer YOUR_TOKEN\`

### การจองสนาม
1. ค้นหาสนามที่ต้องการ \`GET /api/venues\`
2. ดูตารางว่าง \`GET /api/bookings/availability\`
3. สร้างการจอง \`POST /api/bookings\`
4. ชำระเงิน \`POST /api/payments/create\`

## 📋 สิทธิ์การเข้าถึง

| บทบาท | สิทธิ์ |
|--------|--------|
| **Owner** | จัดการระบบทั้งหมด |
| **Manager** | จัดการสนามและอุปกรณ์ |
| **Member** | จองสนามและชำระเงิน |

## 🔗 ช่องทางติดต่อ

หากพบปัญหาหรือมีข้อสงสัย กรุณาติดต่อทีมพัฒนาผ่าน Kunatip.uto@spumail.net

---

**📌 หมายเหตุ:** API นี้รองรับเฉพาะ JSON format และใช้ UTF-8 encoding
      `,
      contact: {
        name: 'API Support Team',
        email: 'Kunatip.uto@spumail.net',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '🔧 Development Server - สำหรับพัฒนาและทดสอบ'
      },
      {
        url: 'https://api.sportbooking.com',
        description: '🌐 Production Server - สำหรับใช้งานจริง'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'ใส่ JWT Token ที่ได้จากการ Login ผ่าน `/api/auth/login`\n\nรูปแบบ: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT Token ที่เก็บใน Cookie (ใช้สำหรับ Web Browser อัตโนมัติ)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'สถานะความสำเร็จของ Request'
            },
            message: {
              type: 'string',
              example: 'เกิดข้อผิดพลาด',
              description: 'ข้อความแจ้งเตือน'
            },
            error: {
              type: 'string',
              example: 'Error details',
              description: 'รายละเอียดข้อผิดพลาด'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', example: 1, description: 'รหัสผู้ใช้' },
            username: { type: 'string', example: 'john_doe', description: 'ชื่อผู้ใช้' },
            email: { type: 'string', example: 'john@example.com', description: 'อีเมล' },
            phone: { type: 'string', example: '0812345678', description: 'เบอร์โทรศัพท์' },
            role: { type: 'string', enum: ['admin', 'manager', 'member'], example: 'member', description: 'บทบาทผู้ใช้' },
            profile_image: { type: 'string', example: '/uploads/profiles/user1.jpg', description: 'รูปโปรไฟล์' },
            is_active: { type: 'integer', example: 1, description: 'สถานะการใช้งาน (1=ใช้งาน, 0=ระงับ)' },
            created_at: { type: 'string', format: 'date-time', description: 'วันที่สร้าง' },
            updated_at: { type: 'string', format: 'date-time', description: 'วันที่อัปเดตล่าสุด' }
          }
        },
        Venue: {
          type: 'object',
          properties: {
            venue_id: { type: 'integer', example: 1, description: 'รหัสสนาม' },
            venue_name: { type: 'string', example: 'สนามกีฬาแห่งชาติ', description: 'ชื่อสนาม' },
            venue_type: { type: 'string', enum: ['football', 'basketball', 'badminton', 'tennis'], example: 'football', description: 'ประเภทกีฬา' },
            location: { type: 'string', example: 'กรุงเทพมหานคร', description: 'ที่อยู่/สถานที่' },
            description: { type: 'string', example: 'สนามฟุตบอลมาตรฐาน FIFA', description: 'รายละเอียดสนาม' },
            opening_time: { type: 'string', example: '06:00:00', description: 'เวลาเปิด' },
            closing_time: { type: 'string', example: '22:00:00', description: 'เวลาปิด' },
            is_active: { type: 'integer', example: 1, description: 'สถานะสนาม (1=เปิด, 0=ปิด)' },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/venues/venue1.jpg'],
              description: 'รูปภาพสนาม'
            },
            court_count: { type: 'integer', example: 5, description: 'จำนวนคอร์ท' },
            avg_rating: { type: 'string', example: '4.5', description: 'คะแนนเฉลี่ย' },
            review_count: { type: 'integer', example: 20, description: 'จำนวนรีวิว' }
          }
        },
        Court: {
          type: 'object',
          properties: {
            court_id: { type: 'integer', example: 1, description: 'รหัสคอร์ท' },
            venue_id: { type: 'integer', example: 1, description: 'รหัสสนาม' },
            court_name: { type: 'string', example: 'สนาม A', description: 'ชื่อคอร์ท' },
            hourly_rate: { type: 'number', format: 'decimal', example: 500.00, description: 'ราคาต่อชั่วโมง (บาท)' },
            capacity: { type: 'integer', example: 22, description: 'จำนวนผู้เล่นสูงสุด' },
            status: { type: 'string', enum: ['available', 'maintenance', 'unavailable'], example: 'available', description: 'สถานะคอร์ท' },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/courts/court1.jpg'],
              description: 'รูปภาพคอร์ท'
            }
          }
        },
        Equipment: {
          type: 'object',
          properties: {
            equipment_id: { type: 'integer', example: 1, description: 'รหัสอุปกรณ์' },
            venue_id: { type: 'integer', example: 1, description: 'รหัสสนาม' },
            equipment_name: { type: 'string', example: 'ลูกฟุตบอล', description: 'ชื่ออุปกรณ์' },
            stock: { type: 'integer', example: 20, description: 'จำนวนคงเหลือ' },
            rental_price: { type: 'number', format: 'decimal', example: 50.00, description: 'ราคาเช่าต่อชิ้น (บาท)' },
            is_active: { type: 'integer', example: 1, description: 'สถานะ (1=ใช้งาน, 0=ไม่ใช้งาน)' },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/equipment/eq1.jpg'],
              description: 'รูปภาพอุปกรณ์'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            booking_id: { type: 'integer', example: 1, description: 'รหัสการจอง' },
            user_id: { type: 'integer', example: 1, description: 'รหัสผู้จอง' },
            venue_id: { type: 'integer', example: 1, description: 'รหัสสนาม' },
            court_id: { type: 'integer', example: 1, description: 'รหัสคอร์ท' },
            booking_date: { type: 'string', format: 'date', example: '2024-12-25', description: 'วันที่จอง' },
            start_time: { type: 'string', example: '09:00:00', description: 'เวลาเริ่ม' },
            end_time: { type: 'string', example: '11:00:00', description: 'เวลาสิ้นสุด' },
            total_price: { type: 'number', format: 'decimal', example: 1000.00, description: 'ราคารวม (บาท)' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'paid', 'cancelled'], example: 'pending', description: 'สถานะการจอง' },
            cancellation_reason: { type: 'string', nullable: true, description: 'เหตุผลในการยกเลิก' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            payment_id: { type: 'integer', example: 1, description: 'รหัสการชำระเงิน' },
            booking_id: { type: 'integer', example: 1, description: 'รหัสการจอง' },
            user_id: { type: 'integer', example: 1, description: 'รหัสผู้ชำระ' },
            amount: { type: 'number', format: 'decimal', example: 1000.00, description: 'จำนวนเงิน (บาท)' },
            method: { type: 'string', enum: ['qr', 'omise'], example: 'omise', description: 'วิธีชำระเงิน' },
            status: { type: 'string', enum: ['pending', 'paid', 'failed'], example: 'pending', description: 'สถานะการชำระ' },
            omise_charge_id: { type: 'string', example: 'chrg_test_123', description: 'Omise Charge ID' },
            qr_code: { type: 'string', example: 'https://omise.co/qr/xxx', description: 'QR Code สำหรับชำระเงิน' },
            paid_at: { type: 'string', format: 'date-time', nullable: true, description: 'เวลาที่ชำระแล้ว' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            notification_id: { type: 'integer', example: 1, description: 'รหัสการแจ้งเตือน' },
            user_id: { type: 'integer', example: 1, description: 'รหัสผู้รับ' },
            title: { type: 'string', example: 'การจองสำเร็จ', description: 'หัวข้อ' },
            message: { type: 'string', example: 'การจองของคุณสำเร็จแล้ว', description: 'ข้อความ' },
            type: { type: 'string', enum: ['booking', 'payment', 'system'], example: 'booking', description: 'ประเภทการแจ้งเตือน' },
            is_read: { type: 'integer', example: 0, description: 'สถานะการอ่าน (1=อ่านแล้ว, 0=ยังไม่อ่าน)' },
            is_hidden: { type: 'integer', example: 0, description: 'สถานะการซ่อน (1=ซ่อน, 0=แสดง)' },
            created_at: { type: 'string', format: 'date-time', description: 'วันที่สร้าง' }
          }
        }
      }
    },
    tags: [
      { 
        name: 'Authentication', 
        description: '🔐 การจัดการ Authentication และ Authorization - ลงทะเบียน, เข้าสู่ระบบ, JWT Token' 
      },
      { 
        name: 'Users', 
        description: '👥 การจัดการข้อมูลผู้ใช้ - CRUD, Profile, เปลี่ยนรหัสผ่าน' 
      },
      { 
        name: 'Venues', 
        description: '🏟️ การจัดการสนามกีฬา - สร้าง, แก้ไข, ค้นหา, รีวิว' 
      },
      { 
        name: 'Courts', 
        description: '🎾 การจัดการคอร์ท - เพิ่มคอร์ท, ตั้งราคา, จัดการสถานะ' 
      },
      { 
        name: 'Equipment', 
        description: '⚽ การจัดการอุปกรณ์ - เพิ่มอุปกรณ์, ตั้งราคาเช่า, จัดการสต็อก' 
      },
      { 
        name: 'Bookings', 
        description: '📅 การจัดการการจอง - สร้างการจอง, ตรวจสอบว่าง, ยกเลิก, ประวัติ' 
      },
      { 
        name: 'Payments', 
        description: '💳 การจัดการการชำระเงิน - สร้างรายการชำระ, ตรวจสอบสถานะ' 
      },
      { 
        name: 'Omise', 
        description: '💰 Omise Payment Gateway - QR Code, Credit Card, Webhooks' 
      },
      { 
        name: 'Notifications', 
        description: '🔔 การจัดการการแจ้งเตือน - ดูแจ้งเตือน, อ่านแล้ว, ลบ' 
      },
      { 
        name: 'Uploads', 
        description: '📁 การอัปโหลดไฟล์ - รูปโปรไฟล์, รูปสนาม, รูปอุปกรณ์' 
      }
    ]
  },
  apis: ['./routes/*.js', './swagger/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;