# 02 — Project Knowledge (ความรู้เกี่ยวกับระบบ COOS)

> ข้อมูลทั้งหมดวิเคราะห์จาก Source Code จริง  
> อัปเดตล่าสุด: 29 มิถุนายน 2568 | Version: 0.3 (Milestone 30%)

---

## 1. ภาพรวมระบบ

| ข้อมูล | รายละเอียด |
|-------|-----------|
| **ชื่อระบบ** | COOS — Creative Order & Online Studio System |
| **ชื่อโครงงาน (TH)** | การพัฒนาเว็บแอปพลิเคชันบริหารจัดการคำสั่งงานสร้างภาพสำหรับสตูดิโอออนไลน์ |
| **ชื่อโครงงาน (EN)** | Development of a Web-Based Application for Managing Image Creation Orders for an Online Studio |
| **ประเภท** | Web Application — สตูดิโอสร้างสรรค์ผลงานภาพดิจิทัลออนไลน์ |
| **ผู้พัฒนา** | 1 คน (Solo Project) |
| **License** | MIT |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Nuxt 3 + Vue 3 + TypeScript | nuxt ^3.12.0 |
| Styling | Tailwind CSS 3 | ^3.4.19 |
| Icons | Iconify (Lucide + Simple Icons) | — |
| Package Manager | pnpm | 10.26.1 |
| Backend | Node.js + Express 5 | ^5.2.1 |
| Database | MySQL 8.0 | mysql2 ^3.16.0 |
| Auth | JWT + bcrypt | jwt ^9.0.3, bcrypt ^6.0.0 |
| File Upload | Multer | ^1.4.5-lts.1 |
| Container | Docker Compose | 3 services |

---

## 3. Architecture

### Backend — MVC Pattern
```
backend/src/
├── server.js          ← Entry Point (Port 3000)
├── app.js             ← Express App + Middleware
├── config/            ← DB Pool, Env, Multer Config
├── middlewares/       ← auth, admin, editor, cors, upload
├── controllers/       ← Business Logic (8 controllers)
├── models/            ← SQL Queries (6 models)
└── routes/v1/         ← API Routes (9 route files)
```

### Frontend — Feature-Based + Role-Based (Nuxt 3)
```
frontend/app/
├── composables/useApi.ts    ← HTTP Utility + JWT Cookie
├── services/                ← auth.service.ts, order.service.ts
├── types/                   ← TypeScript Interfaces
├── middleware/               ← auth, guest, admin, customer, editor
├── layouts/                 ← default, auth, admin, customer, editor
├── components/              ← Feature-Based Components
└── pages/                   ← Role-Based Pages
    ├── index.vue            ← Public Landing + Gallery
    ├── login/register/...   ← Auth Pages
    ├── customer/            ← Customer Pages
    ├── editor/              ← Editor Pages
    └── admin/               ← Admin Pages
```

---

## 4. Database Schema (coosdb — 9 ตาราง)

| ตาราง | คำอธิบาย | PK | FK |
|-------|---------|----|----|
| `users` | ผู้ใช้ทุก Role (admin/customer/editor) | userId | — |
| `workTypes` | ประเภทงาน (Pre-wedding, Portrait, ฯลฯ) | workTypeId | — |
| `packages` | แพ็กเกจบริการ (ราคา, ภาพ, resolution) | packageId | — |
| `galleryImages` | รูปแกลเลอรีสาธารณะ | imageId | workTypeId |
| `policies` | นโยบายสตูดิโอ (refund/terms/privacy) | policyId | — |
| `orders` | คำสั่งงานหลัก (9 สถานะ) | orderId | customerId, editorId, packageId, workTypeId |
| `orderImages` | รูปภาพในออเดอร์ (source/ai_generated/selected_final) | orderImageId | orderId |
| `payments` | การชำระเงิน (deposit/final) | paymentId | orderId, verifiedByAdminId |
| `workflowLogs` | ประวัติการเปลี่ยนสถานะ | logId | orderId, changedById |

### Order Status (9 สถานะ)
```
waiting_deposit → waiting_assignment → waiting_to_start → in_progress
→ waiting_selection → waiting_final_payment → delivered → completed
                                                         ↘ cancelled (จาก waiting_deposit)
```

---

## 5. API Endpoints (Base URL: /api/v1)

### Auth (Public)
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | สมัครสมาชิก |
| POST | /auth/login | เข้าสู่ระบบ → JWT |
| POST | /auth/forgot-password | ขอ Reset Token |
| POST | /auth/reset-password | รีเซ็ตรหัสผ่าน |

### Users (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /users/me | auth |
| PATCH | /users/me | auth + multer |
| GET | /users | auth |
| GET | /users/:id | auth |
| POST | /users | auth + adminOnly |
| PATCH | /users/:id | auth + adminOnly |
| DELETE | /users/:id | auth + adminOnly |

### Packages
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /packages | auth |
| GET | /packages/:id | auth |
| POST | /packages | auth + adminOnly |
| PATCH | /packages/:id | auth + adminOnly |
| DELETE | /packages/:id | auth + adminOnly |

### Work Types
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /work-types | auth |
| POST | /work-types | auth + adminOnly |
| PATCH | /work-types/:id | auth + adminOnly |
| DELETE | /work-types/:id | auth + adminOnly |

### Orders
| Method | Path | Middleware |
|--------|------|-----------|
| POST | /orders | auth |
| GET | /orders | auth (role-filtered) |
| GET | /orders/:id | auth |
| PATCH | /orders/:id/status | auth |
| PATCH | /orders/:id/assign | auth |
| POST | /orders/:id/images | auth |
| POST | /orders/:id/payments | auth |
| PATCH | /orders/:id/payments/:paymentId | auth |

### Gallery, Policies (Public GET / Admin Write)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /gallery-images | public |
| POST/PATCH/DELETE | /gallery-images/* | auth + adminOnly |
| GET | /policies | public |
| POST/PATCH/DELETE | /policies/* | auth + adminOnly |

### Upload (auth required)
| Method | Path | Max Size |
|--------|------|---------|
| POST | /upload/source | 20MB |
| POST | /upload/source/multiple | 20MB × 10 |
| POST | /upload/slip | 10MB |
| POST | /upload/profile | 5MB |
| POST | /upload/gallery | 10MB |

---

## 6. Authentication Flow

```
1. Register → bcrypt hash password → role = customer (default)
2. Login → bcrypt.compare → JWT sign (1d) → return token + user
3. Client → useCookie("token"), useCookie("userRole")
4. Request → Header: "Authorization: Bearer <token>"
5. auth.middleware.js → jwt.verify → req.session = decoded
6. Role Guard → admin/editor/adminOrEditor middleware
```

### JWT Payload
```json
{
  "userId": 1,
  "userFirstName": "...",
  "userRole": "customer|admin|editor",
  "userEmail": "...",
  "iat": ..., "exp": ...
}
```

---

## 7. Business Logic หลัก

### Price Calculation (Backend เท่านั้น)
```javascript
orderBasePrice    = package.packagePrice
orderUrgentPrice  = orderIsUrgent ? package.packageUrgentPrice : 0
orderDiscount     = orderIsGalleryAllowed ? (base × galleryDiscount%) : 0
orderTotalPrice   = base + urgent - discount
```

### Payment Split
- มัดจำ (deposit): **30%** ของ orderTotalPrice
- ส่วนที่เหลือ (final): **70%** ของ orderTotalPrice

### State Machine Transitions
```javascript
// isValidTransition(role, from, to) — ใน orderController.js
Admin:    สามารถเปลี่ยนได้ทุก transition
Customer: waiting_deposit → cancelled
          waiting_selection → waiting_final_payment
Editor:   waiting_to_start → in_progress
          in_progress → waiting_selection
          delivered → completed
```

### Auto-Transition (verifyPayment)
- Deposit Approved + มี editorId → `waiting_to_start`
- Deposit Approved + ไม่มี editorId → `waiting_assignment`
- Final Approved → `completed`

---

## 8. Features ที่พัฒนาแล้ว vs ยังไม่มี

### ✅ พัฒนาแล้ว
- Authentication (Register/Login/Forgot/Reset)
- User Management (CRUD + Profile + Avatar Upload)
- WorkType Management (CRUD)
- Package Management (CRUD)
- Order System (4-step wizard, 9-status state machine)
- Payment (Slip Upload + Admin Verify)
- Order Assignment (Admin → Editor)
- Source Image Upload (max 10 files)
- AI Generated Image Upload + Prompt Logging
- Gallery Management (CRUD + Toggle)
- Policy Management (CRUD)
- Editor 6-Tab Workspace
- Admin Dashboard (basic stats)
- Workflow Logs Timeline

### ⚠️ Known Gaps (ยังไม่สมบูรณ์)
- `/admin/gallery` page ไม่มีไฟล์จริง (มีแต่ใน Sidebar)
- Email System ยังไม่มี (Forgot Password ส่ง Token ใน Response)
- Register ยังสามารถส่ง `userRole: "admin"` ได้ (Security Issue)
- `useApi.ts` ไม่ parse Error Body จาก Backend
- Mobile Responsive ยังไม่สมบูรณ์

---

## 9. Infrastructure (Docker Compose)

| Service | Image | Port | Volume |
|---------|-------|------|--------|
| `db` | mysql:8.0 | 3306 | db_data + init.sql |
| `backend` | Node.js Dockerfile | 3000 | src/, uploads_data |
| `frontend` | Nuxt Dockerfile | 8888 | app/, public/ |

```bash
# Start all services
docker compose up --build

# Stop
docker compose down
```

---

*วิเคราะห์จาก: database.sql, orderController.js, auth.controller.js, nuxt.config.ts, FRONTEND_ARCHITECTURE.md*
