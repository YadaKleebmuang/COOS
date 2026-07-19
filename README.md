# 🎨 COOS — Creative Order & Online Studio System

**COOS** คือระบบเว็บแอปพลิเคชันสำหรับ **สตูดิโอสร้างสรรค์ผลงานภาพดิจิทัลออนไลน์**
ลูกค้าสามารถเลือกสไตล์ เลือกแพ็กเกจ และสั่งงานภาพผ่านระบบ
โดยมี Admin จัดการข้อมูลระบบ และ Editor รับผลิตผลงานตาม Workflow ที่กำหนด

> 🎓 โปรเจกต์นี้จัดทำเพื่อจำลองการทำงานของแพลตฟอร์มให้บริการงานศิลปะดิจิทัลในโลกจริง

---

## 🚀 Features

### ✅ พัฒนาแล้ว (Sprint 1-4)
- 🔐 **ระบบ Authentication** — สมัครสมาชิก / เข้าสู่ระบบ (JWT + bcrypt)
- 👤 **จัดการผู้ใช้** — ดูข้อมูลผู้ใช้, แยก Role (Admin / Customer / Editor)
- 🧩 **จัดการประเภทงาน (Work Types) และ Tags** — CRUD ประเภทงาน และแท็กสำหรับกรองแกลเลอรี
- 📦 **จัดการแพ็กเกจ (Packages)** — CRUD แพ็กเกจ เช่น Basic, Standard, Pro พร้อมระบบราคาด่วนและส่วนลดแกลเลอรี
- 📝 **ระบบสั่งงาน (Orders)** — สร้าง/ดู/อัปเดตสถานะคำสั่งงาน พร้อม Workflow 9 ขั้นตอน
- 💳 **ระบบชำระเงิน (Payments)** — อัปโหลดสลิป, ตรวจสอบสถานะการชำระเงิน (มัดจำ / ส่วนที่เหลือ)
- 🖼 **Gallery Showcase** — แกลเลอรีสาธารณะสำหรับแสดงผลงาน (รองรับการกรองและค้นหา)
- 📜 **นโยบาย (Policies) และการตั้งค่าระบบ (Settings)** — จัดการเนื้อหานโยบาย และตั้งค่าระบบแบบ Key-Value
- 🎨 **Editor 6-Tab Workspace** — หน้าจอรับงาน จัดการผลงาน และอัปโหลดภาพ AI สำหรับ Editor
- 📊 **Admin Dashboard & Reports** — สรุปสถิติ รายได้ และภาพรวมของระบบสำหรับ Admin
- 📱 **Mobile Responsive Design** — รองรับการแสดงผลบนอุปกรณ์มือถือและแท็บเล็ต
- 🧪 **Automated Testing** — รองรับระบบ Unit Tests ด้วย Jest และ Supertest สำหรับ Core Business Logic

### ⏳ อยู่ระหว่างพัฒนาและปรับปรุง
- 📧 **ระบบอีเมล (Email System)** — เชื่อมต่อ SMTP จริงสำหรับการรีเซ็ตรหัสผ่าน (Forgot Password)
- 🛠 **ขยายขอบเขตการทดสอบ (Testing Coverage)** — เพิ่ม Integration Tests สำหรับโมดูลอื่นๆ
- 🚀 **Deployment** — เตรียมไฟล์ Docker และสคริปต์สำหรับการนำขึ้น Production

---

## 🏗 Tech Stack

| Layer        | Technology                                      |
|-------------|--------------------------------------------------|
| **Frontend** | Nuxt 3 (Vue 3) + TypeScript                     |
| **Styling**  | Tailwind CSS 3                                   |
| **Icons**    | Iconify (Lucide + Simple Icons)                  |
| **Backend**  | Node.js + Express 5                              |
| **Database** | MySQL (mysql2)                                   |
| **Auth**     | JSON Web Token (JWT) + bcrypt                    |
| **Testing**  | Jest + Supertest                                 |

---

## 📂 Project Structure

```
COOS/
├── backend/                    # REST API Server
│   ├── database.sql            # Database schema & sample data
│   ├── jest.config.js          # Jest Testing configuration
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── app.js              # Express app setup
│   │   ├── config/             # Database connection config
│   │   ├── controllers/        # Request handlers (13 controllers)
│   │   ├── models/             # Database models (9 models)
│   │   ├── middlewares/        # Auth, Role, Upload, Error middlewares
│   │   ├── utils/              # Utility functions (เช่น email)
│   │   └── routes/v1/          # API v1 routes
│   └── tests/                  # Unit & Integration Tests
│
├── frontend/                   # Nuxt 3 Application
│   ├── nuxt.config.ts          # Nuxt configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── app/
│   │   ├── pages/              # Page routes (Public, Admin, Customer, Editor)
│   │   ├── components/         # Reusable Vue components
│   │   ├── layouts/            # Layouts (Default, Admin, Customer, Editor, Auth)
│   │   ├── middleware/         # Nuxt route guards (Role verification)
│   │   ├── composables/        # API composable utility (useApi.ts)
│   │   ├── services/           # Service layer for API endpoints
│   │   ├── types/              # TypeScript Interfaces
│   │   └── utils/              # Utility helpers
│
├── docs/                       # Project Documentation & AI Context
└── README.md
```

---

## 🗄 Database (MySQL)

ฐานข้อมูลชื่อ `coosdb` ประกอบด้วย 12 ตารางหลัก:

| ตาราง            | คำอธิบาย                                        |
|------------------|-------------------------------------------------|
| `users`          | ผู้ใช้งาน (Admin, Customer, Editor)              |
| `workTypes`      | ประเภทงาน เช่น Pre-wedding, Portrait, ครอบครัว    |
| `packages`       | แพ็กเกจ (Basic / Standard / Pro) พร้อมราคา       |
| `tags`           | ป้ายกำกับ (Tags) สำหรับใช้คัดกรองรูปภาพ            |
| `galleryImages`  | รูปภาพแกลเลอรี                                  |
| `galleryTags`    | ตารางเชื่อมความสัมพันธ์แบบ Many-to-Many ของรูปภาพและแท็ก |
| `policies`       | นโยบาย (เงื่อนไข / คืนเงิน / ความเป็นส่วนตัว)     |
| `systemSettings` | การตั้งค่าระบบแบบ Key-Value (เช่น สัดส่วนมัดจำ)      |
| `orders`         | คำสั่งงาน พร้อม Workflow 9 สถานะ                  |
| `orderImages`    | รูปภาพประกอบคำสั่งงาน (Source/AI) + Prompt        |
| `payments`       | การชำระเงิน (มัดจำ / ส่วนที่เหลือ)                 |
| `workflowLogs`   | ประวัติการเปลี่ยนสถานะงาน                         |

---

## 🔁 Order Workflow

คำสั่งงานมี **9 สถานะ** ตาม Workflow:

```
รอชำระมัดจำ → รอมอบหมายงาน → รอเริ่มดำเนินการ → อยู่ระหว่างดำเนินการ
→ รอคัดเลือกผลงาน → รอชำระส่วนที่เหลือ → ส่งมอบผลงาน → เสร็จสมบูรณ์
                                                        ↘ ยกเลิก
```

---

## 👥 User Roles

| Role       | สิทธิ์การใช้งาน                                    |
|-----------|-----------------------------------------------------|
| **Customer** | เลือกแพ็กเกจ, สั่งงาน, ชำระเงิน, เลือกผลงาน, ดาวน์โหลดภาพ |
| **Admin**    | จัดการข้อมูลระบบทั้งหมด, มอบหมายงาน, ตรวจสอบการชำระเงิน, ดูสถิติ |
| **Editor**   | รับงาน, อัปโหลดภาพ AI, จัดการภาพตามสเต็ปของ Workflow  |

---