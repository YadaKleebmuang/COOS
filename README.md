# 🎨 COOS — Creative Order & Online Studio System

**COOS** คือระบบเว็บแอปพลิเคชันสำหรับ **สตูดิโอสร้างสรรค์ผลงานภาพดิจิทัลออนไลน์**
ลูกค้าสามารถเลือกสไตล์ เลือกแพ็กเกจ และสั่งงานภาพผ่านระบบ
โดยมี Admin จัดการข้อมูลระบบ และ Editor รับผลิตผลงานตาม Workflow ที่กำหนด

> 🎓 โปรเจกต์นี้จัดทำเพื่อจำลองการทำงานของแพลตฟอร์มให้บริการงานศิลปะดิจิทัลในโลกจริง

---

## 🚀 Features

### ✅ พัฒนาแล้ว
- 🔐 **ระบบ Authentication** — สมัครสมาชิก / เข้าสู่ระบบ (JWT + bcrypt)
- 👤 **จัดการผู้ใช้** — ดูข้อมูลผู้ใช้, แยก Role (Admin / Customer / Editor)
- 🧩 **จัดการประเภทงาน (Work Types)** — CRUD ประเภทงาน เช่น Pre-wedding, Portrait
- 📦 **จัดการแพ็กเกจ (Packages)** — CRUD แพ็กเกจ เช่น Basic, Standard, Pro
- 📝 **ระบบสั่งงาน (Orders)** — สร้าง/ดู/อัปเดตสถานะคำสั่งงาน พร้อม Workflow 9 ขั้นตอน

### 🔜 อยู่ระหว่างพัฒนา
- 🖼 **Gallery Showcase** — แกลเลอรีแสดงผลงาน (กรองตามประเภทงาน & แท็ก)
- 💳 **ระบบชำระเงิน (Payments)** — อัปโหลดสลิป, แบ่งจ่ายมัดจำ 30% / ส่วนที่เหลือ 70%
- 📜 **นโยบาย (Policies)** — เงื่อนไขการใช้บริการ, การคืนเงิน, ความเป็นส่วนตัว
- 🎨 **Editor Workflow** — หน้าจอรับงานและจัดการผลงานสำหรับ Editor
- 📊 **Dashboard & Reports** — รายงานสรุปภาพรวมสำหรับ Admin

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

---

## 📂 Project Structure

```
COOS/
├── backend/                    # REST API Server
│   ├── database.sql            # Database schema & sample data
│   └── src/
│       ├── server.js           # Entry point
│       ├── app.js              # Express app setup
│       ├── config/             # Database connection config
│       ├── controllers/        # Request handlers
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── workTypeController.js
│       │   ├── packageController.js
│       │   └── orderController.js
│       ├── models/             # Database queries
│       │   ├── user.model.js
│       │   ├── workTypeModel.js
│       │   ├── packageModel.js
│       │   └── orderModel.js
│       ├── middlewares/        # Auth & CORS middleware
│       └── routes/v1/          # API v1 routes
│
├── frontend/                   # Nuxt 3 Application
│   ├── nuxt.config.ts          # Nuxt configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── pages/                  # Page routes
│   │   ├── index.vue           # หน้าแรก
│   │   ├── login.vue           # หน้าเข้าสู่ระบบ
│   │   └── register.vue        # หน้าสมัครสมาชิก
│   ├── app/
│   │   ├── components/         # Reusable components
│   │   └── services/           # API service layer
│   │       └── auth.service.ts
│   └── composables/
│       └── useApi.ts           # API composable utility
│
└── README.md
```

---

## 🗄 Database (MySQL)

ฐานข้อมูลชื่อ `coosdb` ประกอบด้วยตารางหลัก:

| ตาราง            | คำอธิบาย                                        |
|------------------|-------------------------------------------------|
| `users`          | ผู้ใช้งาน (Admin, Customer, Editor)              |
| `workTypes`      | ประเภทงาน เช่น Pre-wedding, Portrait, ครอบครัว    |
| `packages`       | แพ็กเกจ (Basic / Standard / Pro) พร้อมราคา       |
| `galleryImages`  | รูปภาพแกลเลอรี พร้อมแท็กและประเภทงาน             |
| `policies`       | นโยบาย (เงื่อนไข / คืนเงิน / ความเป็นส่วนตัว)     |
| `orders`         | คำสั่งงาน พร้อม Workflow 9 สถานะ                  |
| `orderImages`    | รูปภาพประกอบคำสั่งงาน + AI Prompt                |
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
| **Customer** | เลือกแพ็กเกจ, สั่งงาน, ชำระเงิน, ดูผลงาน          |
| **Admin**    | จัดการข้อมูลระบบ, มอบหมายงาน, ตรวจสอบการชำระเงิน   |
| **Editor**   | รับงาน, ผลิตผลงาน, อัปโหลดภาพ                      |

---

## 📄 License

MIT

---

> พัฒนาด้วย ❤️ โดยใช้ Nuxt 3 + Express 5 + MySQL