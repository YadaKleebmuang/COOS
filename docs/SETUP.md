## ⚡ Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL
- pnpm (สำหรับ frontend)

### 1. ตั้งค่า Database

```bash
# Import schema & sample data ไปยัง MySQL
mysql -u root -p < backend/database.sql
```

### 2. ตั้งค่า Backend

```bash
cd backend
npm install

# สร้างไฟล์ .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=coosdb

npm run dev        # รันที่ http://localhost:3000
```

### 3. ตั้งค่า Frontend

```bash
cd frontend
pnpm install
pnpm dev           # รันที่ http://localhost:8888
```

---

## 📡 API Endpoints (v1)

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint             | คำอธิบาย              |
|--------|----------------------|-----------------------|
| POST   | `/auth/register`     | สมัครสมาชิก            |
| POST   | `/auth/login`        | เข้าสู่ระบบ            |
| GET    | `/users`             | ดูรายชื่อผู้ใช้         |
| GET    | `/work-types`        | ดูประเภทงานทั้งหมด      |
| GET    | `/packages`          | ดูแพ็กเกจทั้งหมด        |
| POST   | `/orders`            | สร้างคำสั่งงาน          |
| GET    | `/orders`            | ดูรายการคำสั่งงาน       |
| PATCH  | `/orders/:id/status` | อัปเดตสถานะคำสั่งงาน    |