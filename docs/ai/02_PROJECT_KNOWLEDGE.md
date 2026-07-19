# 02 — Project Knowledge (ความรู้เกี่ยวกับระบบ COOS)

> ข้อมูลทั้งหมดวิเคราะห์จาก Source Code จริง  
> อัปเดตล่าสุด: 15 กรกฎาคม 2568 | Version: 0.4 (Milestone ~40%)

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
| Icons | Iconify (Lucide + Simple Icons) | @iconify-json/lucide ^1.2.82 |
| Package Manager | pnpm | 10.26.1 |
| Backend | Node.js + Express 5 | ^5.2.1 |
| Database | MySQL 8.0 | mysql2 ^3.16.0 |
| Auth | JWT + bcrypt | jsonwebtoken ^9.0.3, bcrypt ^6.0.0 |
| File Upload | Multer | ^1.4.5-lts.1 |
| Container | Docker Compose | 3 services (db, backend, frontend) |

> **หมายเหตุ:** frontend/package.json มี `axios` และ `better-sqlite3` เป็น dependency แต่ยังไม่ถูกใช้งานจริงในโค้ด

---

## 3. Architecture

### Backend — MVC Pattern
```
backend/src/
├── server.js              ← Entry Point (Port 3000)
├── app.js                 ← Express App + Middleware Setup
├── config/
│   ├── db.js              ← MySQL Pool (connection retry 10 ครั้ง)
│   ├── env.js             ← Environment Config
│   └── upload.js          ← Multer Config (5 upload types)
├── middlewares/
│   ├── auth.middleware.js         ← JWT verify → req.session
│   ├── admin.middleware.js        ← userRole === "admin"
│   ├── editor.middleware.js       ← userRole === "editor"
│   ├── adminOrEditor.middleware.js← role === "admin" || "editor"
│   ├── cors.middleware.js         ← CORS (localhost:8888 only)
│   └── upload.middleware.js       ← Multer error handler
├── controllers/ (13 ไฟล์)
│   ├── auth.controller.js         ← Register/Login/Forgot/Reset
│   ├── user.controller.js         ← User CRUD + Profile
│   ├── orderController.js         ← Order + Payment (ใน order context)
│   ├── payment.controller.js      ← Payment List + Approve/Reject (admin)
│   ├── packageController.js       ← Package CRUD
│   ├── workTypeController.js      ← WorkType CRUD
│   ├── galleryImage.controller.js ← Gallery CRUD + Toggle + Tags
│   ├── policy.controller.js       ← Policy CRUD
│   ├── upload.controller.js       ← File Upload Response
│   ├── report.controller.js       ← Dashboard Stats (6 KPIs)
│   ├── setting.controller.js      ← System Settings Get/Update
│   ├── file.controller.js         ← File Listing (admin)
│   └── tag.controller.js          ← Tags CRUD
├── models/ (9 ไฟล์)
│   ├── user.model.js              ← Users queries
│   ├── orderModel.js              ← Orders + Images + Payments + Logs
│   ├── payment.model.js           ← Payments standalone queries
│   ├── packageModel.js            ← Packages queries
│   ├── workTypeModel.js           ← WorkTypes queries
│   ├── galleryImage.model.js      ← Gallery queries
│   ├── policy.model.js            ← Policies queries
│   ├── setting.model.js           ← SystemSettings queries
│   └── tag.model.js               ← Tags queries
└── routes/v1/ (14 ไฟล์)
    ├── index.js           ← Router aggregator
    ├── auth.route.js
    ├── user.route.js
    ├── orders.route.js
    ├── payments.route.js  ← Admin payment management
    ├── packages.route.js
    ├── workTypes.route.js
    ├── galleryImages.route.js
    ├── policies.route.js
    ├── upload.route.js
    ├── reports.route.js   ← Dashboard stats (adminOnly)
    ├── settings.route.js  ← System settings (adminOnly)
    ├── files.route.js     ← File listing (adminOnly)
    └── tag.route.js       ← Tags CRUD
```

### Frontend — Feature-Based + Role-Based (Nuxt 3)
```
frontend/app/
├── app.vue                      ← Root component
├── app.config.ts                ← App config
├── nuxt.config.ts               ← Nuxt config (port 8888, apiBase)
├── composables/
│   └── useApi.ts                ← fetch wrapper + JWT cookie + error parsing
├── services/
│   ├── auth.service.ts          ← Register/Login/Logout/Forgot/Reset
│   └── order.service.ts         ← Order CRUD + Upload + Payment
├── types/
│   ├── auth.types.ts            ← RegisterForm, AuthResponse
│   ├── user.types.ts            ← User interface
│   └── order.types.ts           ← WorkType, Package, Order*, Payment, WorkflowLog
├── middleware/
│   ├── auth.ts                  ← ตรวจ token cookie
│   ├── guest.ts                 ← redirect ถ้า login แล้ว
│   ├── admin.ts                 ← ตรวจ userRole === "admin" (cookie)
│   ├── customer.ts              ← ตรวจ userRole === "customer" (cookie)
│   └── editor.ts                ← ตรวจ userRole === "editor" (cookie)
├── layouts/
│   ├── default.vue              ← Public layout
│   ├── auth.vue                 ← Auth pages layout
│   ├── admin.vue                ← Admin layout + AdminSidebar
│   ├── customer.vue             ← Customer layout
│   └── editor.vue               ← Editor layout
├── components/
│   ├── admin/                   ← 10 components (ActionButton, AdminBreadcrumb,
│   │                               AdminSidebar, AdminTopbar, ConfirmDialog,
│   │                               DataTable, EmptyState, FilterBar,
│   │                               StatCard, StatusBadge)
│   ├── editor/job/              ← 8 tab components (GeneratedImagesTab,
│   │                               HistoryTab, JobHeader, JobTabs,
│   │                               OverviewTab, PromptLogsTab,
│   │                               SelectedImagesTab, SourceImagesTab)
│   └── layout/                  ← 5 layout components (FooterPublic,
│                                   NavbarCustomer, NavbarPublic,
│                                   NavbarStaff, SidebarDashboard)
└── pages/
    ├── index.vue                ← Public Landing + Gallery showcase
    ├── login.vue                ← Login page (middleware: guest)
    ├── register.vue             ← Register page (middleware: guest)
    ├── forgot-password.vue      ← Forgot password page
    ├── reset-password.vue       ← Reset password page
    ├── admin/                   ← 13 Admin pages
    │   ├── dashboard.vue        ← Stats + Recent orders
    │   ├── users.vue            ← User CRUD
    │   ├── orders.vue           ← All orders management
    │   ├── assignments.vue      ← Editor assignment management
    │   ├── payments.vue         ← Payment verification
    │   ├── packages.vue         ← Package CRUD
    │   ├── work-types.vue       ← WorkType CRUD
    │   ├── gallery.vue          ← Gallery management
    │   ├── policies.vue         ← Policy CRUD
    │   ├── reports.vue          ← Advanced reports/charts
    │   ├── settings.vue         ← System settings
    │   ├── files.vue            ← File management
    │   └── categories-tags.vue  ← Tag management
    ├── customer/
    │   ├── dashboard.vue        ← Customer dashboard
    │   ├── profile.vue          ← Profile management
    │   └── orders/
    │       ├── index.vue        ← Order list
    │       ├── create.vue       ← 4-step order wizard
    │       └── [id].vue         ← Order detail + payment slip upload
    └── editor/
        ├── dashboard.vue        ← Editor dashboard
        ├── profile.vue          ← Profile management
        └── jobs/
            ├── index.vue        ← Job list (assigned orders)
            └── [id].vue         ← Job workspace (6 tabs)
```

---

## 4. Database Schema (coosdb — 11 ตาราง)

| ตาราง | คำอธิบาย | PK | FK |
|-------|---------|----|---|
| `users` | ผู้ใช้ทุก Role (admin/customer/editor) + reset token | userId | — |
| `workTypes` | ประเภทงาน (Pre-wedding, Portrait, ฯลฯ) | workTypeId | — |
| `packages` | แพ็กเกจบริการ (ราคา, ภาพ, resolution, discount) | packageId | — |
| `galleryImages` | รูปแกลเลอรีสาธารณะ + tags | imageId | workTypeId |
| `policies` | นโยบายสตูดิโอ (refund/terms/privacy) | policyId | — |
| `orders` | คำสั่งงานหลัก (9 สถานะ) | orderId | customerId, editorId, packageId, workTypeId |
| `orderImages` | รูปภาพในออเดอร์ + AI prompt data | orderImageId | orderId |
| `payments` | การชำระเงิน (deposit/final) + slip URL | paymentId | orderId, verifiedByAdminId |
| `workflowLogs` | ประวัติการเปลี่ยนสถานะทุก transition | logId | orderId, changedById |
| `systemSettings` | ค่าตั้งค่าระบบ (key-value) | settingKey | updatedByAdminId |
| `tags` | แท็กสำหรับแกลเลอรี | tagId | — |

> **หมายเหตุ:** เดิมเอกสารระบุ 9 ตาราง แต่จาก `database.sql` จริงมี 11 ตาราง (เพิ่ม systemSettings + tags)

### Order Status (9 สถานะ)
```
waiting_deposit → waiting_assignment → waiting_to_start → in_progress
→ waiting_selection → waiting_final_payment → delivered → completed
                                                         ↘ cancelled (จาก waiting_deposit เท่านั้น)
```

### Database Files
- `backend/database.sql` — Schema หลัก + seed systemSettings
- `backend/migrations/001_add_user_profile_fields.sql` — Migration สำหรับ DB เก่า (idempotent)

---

## 5. API Endpoints (Base URL: /api/v1)

### Auth (Public — ไม่ต้อง login)
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | สมัครสมาชิก (role ถูก hardcode = "customer") |
| POST | /auth/login | เข้าสู่ระบบ → JWT token |
| POST | /auth/forgot-password | ขอ Reset Token (⚠️ ยังส่ง token ใน response) |
| POST | /auth/reset-password | รีเซ็ตรหัสผ่านด้วย token |

### Users (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /users/me | auth |
| PATCH | /users/me | auth + multer (profile upload) |
| GET | /users | auth + adminOnly |
| GET | /users/:id | auth (⚠️ ควร ownership check) |
| POST | /users | auth + adminOnly |
| PATCH | /users/:id | auth + adminOnly |
| DELETE | /users/:id | auth + adminOnly |

### Packages (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /packages | auth (admin: ?all=true ดูทั้งหมด) |
| GET | /packages/:id | auth |
| POST | /packages | auth + adminOnly |
| PATCH | /packages/:id | auth + adminOnly |
| DELETE | /packages/:id | auth + adminOnly |

### Work Types (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /work-types | auth (admin: ?all=true ดูทั้งหมด) |
| POST | /work-types | auth + adminOnly |
| PATCH | /work-types/:id | auth + adminOnly |
| DELETE | /work-types/:id | auth + adminOnly (soft delete via isActive) |

### Orders (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| POST | /orders | auth (customer only — ตรวจใน controller) |
| GET | /orders | auth (role-filtered: customer=own, editor=assigned, admin=all) |
| GET | /orders/:id | auth (ownership check) |
| PATCH | /orders/:id/status | auth (state machine + ownership) |
| PATCH | /orders/:id/assign | auth (admin only — ตรวจใน controller) |
| POST | /orders/:id/images | auth (role-based image type restriction) |
| POST | /orders/:id/payments | auth (customer only) |
| PATCH | /orders/:id/payments/:paymentId | auth (admin only) |

### Payments — Admin Management (auth + adminOnly)
| Method | Path | Description |
|--------|------|-------------|
| GET | /payments | ดูสลิปทั้งหมด (?status=pending/approved/rejected) |
| PATCH | /payments/:id/approve | อนุมัติสลิป (⚠️ มี logic bug — ดู Known Issues) |
| PATCH | /payments/:id/reject | ปฏิเสธสลิป |

### Gallery Images
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /gallery-images | public |
| GET | /gallery-images/tags | public |
| GET | /gallery-images/:id | public |
| POST | /gallery-images | auth + adminOnly + multer |
| PATCH | /gallery-images/:id | auth + adminOnly + multer |
| PATCH | /gallery-images/:id/toggle | auth + adminOnly |
| DELETE | /gallery-images/:id | auth + adminOnly |

### Policies
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /policies | public |
| GET | /policies/:id | public |
| POST | /policies | auth + adminOnly |
| PATCH | /policies/:id | auth + adminOnly |
| DELETE | /policies/:id | auth + adminOnly |

### Tags (auth required)
| Method | Path | Middleware |
|--------|------|-----------|
| GET | /tags | auth |
| POST | /tags | auth + adminOnly |
| PATCH | /tags/:id | auth + adminOnly |
| DELETE | /tags/:id | auth + adminOnly |

### Upload (auth required)
| Method | Path | Field | Max Size |
|--------|------|-------|---------|
| POST | /upload/source | "image" | 20MB |
| POST | /upload/source/multiple | "images" | 20MB × 10 files |
| POST | /upload/slip | "image" | 10MB |
| POST | /upload/profile | "image" | 5MB |
| POST | /upload/gallery | "image" | 10MB |

> **Upload directories:** `/uploads/profiles/`, `/uploads/slips/`, `/uploads/sources/`, `/uploads/ai-generated/`, `/uploads/gallery/`

### Reports (auth + adminOnly)
| Method | Path | Description |
|--------|------|-------------|
| GET | /reports | Dashboard KPI stats (totalOrders, revenue, byStatus, popularPackages, editorWorkload, revenueByMonth) |

### Settings (auth + adminOnly)
| Method | Path | Description |
|--------|------|-------------|
| GET | /settings | ดูค่าตั้งค่าระบบทั้งหมด |
| PATCH | /settings | อัปเดตค่าตั้งค่า (key-value object) |

### Files (auth + adminOnly)
| Method | Path | Description |
|--------|------|-------------|
| GET | /files | ดูไฟล์ทั้งหมด (orderImages + paymentSlips) |

---

## 6. Authentication Flow

```
1. Register → hardcode role="customer" → bcrypt.hash(password, 10) → INSERT users
2. Login → findByEmail → bcrypt.compare → jwt.sign(payload, secret, {expiresIn: "1d"})
3. Client → useCookie("token") = JWT, useCookie("userRole") = role
4. API Request → Header: "Authorization: Bearer <token>"
5. auth.middleware.js → jwt.verify(token, JWT_SECRET) → req.session = decoded
6. Role Guard → admin.middleware / editor.middleware / adminOrEditor.middleware
```

### JWT Payload (ใน token)
```json
{
  "userId": 1,
  "userFirstName": "...",
  "userLastName": "...",
  "userRole": "customer|admin|editor",
  "userEmail": "...",
  "userProfileImage": "...",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Logout
- Client-side only: ล้าง cookie `token` และ `userRole` (ไม่มี blacklist/revoke ที่ backend)

---

## 7. Business Logic หลัก

### Price Calculation (Backend เท่านั้น — orderController.js)
```javascript
orderBasePrice    = Number(package.packagePrice)
orderUrgentPrice  = orderIsUrgent ? Number(package.packageUrgentPrice || 0) : 0.00
orderDiscount     = orderIsGalleryAllowed
                    ? (orderBasePrice × Number(package.packageGalleryDiscount || 20.00)) / 100
                    : 0.00
orderTotalPrice   = orderBasePrice + orderUrgentPrice - orderDiscount
```

### Payment Split
- มัดจำ (deposit): **30%** ของ orderTotalPrice
- ส่วนที่เหลือ (final): **70%** ของ orderTotalPrice
- ⚠️ Backend ยังไม่ validate ว่า paymentAmount ส่งมาถูกต้องหรือไม่

### State Machine Transitions (orderController.js — isValidTransition)
```javascript
Admin:    สามารถเปลี่ยนได้ทุก transition (return true)
Customer: waiting_deposit → cancelled
          waiting_selection → waiting_final_payment
Editor:   waiting_to_start → in_progress
          in_progress → waiting_selection
          delivered → completed
```

### Auto-Transition เมื่อ Admin Approve Payment (orderController.verifyPayment — ถูกต้อง)
- Deposit Approved + มี editorId → `waiting_to_start`
- Deposit Approved + ไม่มี editorId → `waiting_assignment`
- Deposit Approved + มี editorId → `waiting_to_start`
- Final Approved → `completed`

### Auto-Transition เมื่อ Admin Assign Editor (orderModel.assignEditor)
- ถ้า order อยู่ที่ `waiting_assignment` + editorId ไม่ใช่ null → auto transition ไป `waiting_to_start`

---

## 8. Features ที่พัฒนาแล้ว vs ยังไม่มี

### ✅ พัฒนาแล้ว (ยืนยันจาก Source Code)
- Authentication: Register / Login / Forgot Password / Reset Password
- User Management: CRUD + Profile Upload + Avatar
- WorkType Management: CRUD + soft-toggle isActive
- Package Management: CRUD + toggle isActive
- Order System: 4-step wizard, 9-status state machine, price calculation
- Payment: Customer slip upload + Admin verify/reject (2 paths)
- Order Assignment: Admin → Editor + auto-transition
- Source Image Upload: max 10 files per order
- AI Generated Image Upload + Prompt Logging (engine, positive/negative prompt, cfg, steps, seed)
- Image Selection: selected_final type
- Gallery Management: CRUD + Toggle Active + Tags
- Policy Management: CRUD (refund/terms/privacy types)
- Editor 6-Tab Workspace: Overview, Source Images, Generated Images, Prompt Logs, Selected Images, History
- Admin Dashboard: KPI stats + Orders by status + Popular packages + Editor workload + Revenue by month
- Workflow Logs: Timeline per order
- Tags Management: CRUD (สำหรับแกลเลอรี)
- System Settings: Key-value store (maxUploadSize, depositPercentage, maintenanceMode ฯลฯ)
- File Management: Admin listing ของไฟล์ทั้งหมดในระบบ
- Admin Assignments Page: มอบหมายงาน Editor แบบ dedicated page

### ⚠️ Known Issues (ปัญหาที่รู้แล้ว — ยืนยันจาก Code)
- **[Security]** `forgotPassword` ป้องกันการเดาอีเมลโดยคืนค่าเป็นข้อความทั่วไปเสมอ
- **[Security-Critical]** JWT_SECRET hardcode ใน `docker-compose.yml` เป็น "supersecretkey123"
- **[Security-Critical]** `backend/.env` ถูก commit เข้า git (ไม่มีใน .gitignore)
- **[Security-High]** `GET /users/:id` ไม่มี ownership check
- **[Security-High]** JWT Cookie ไม่มี `httpOnly: true` และ `findById()` return `userPassword` hash
- **[Security-High]** ไม่มี Rate Limiting บน auth endpoints
- **[Bug-High]** `payment.controller.approvePayment` มี logic ผิด 2 จุด:
  - deposit approval → สลับไป `waiting_assignment` หรือ `waiting_to_start` ตามการมอบหมาย
  - final approval → `completed`
- **[Bug-High]** ไม่มีการป้องกัน duplicate payment submission
- **[Bug-High]** ไม่ validate `paymentAmount` ที่ backend
- **[Missing]** Email System ยังไม่ implement (SMTP config มีแต่ไม่มีโค้ดส่งจริง)
- **[Missing]** Mobile Responsive ยังไม่รองรับ
- **[Missing]** ไม่มี Test ใดๆ (Unit, Integration, E2E)
- **[Quality]** `upload.controller.js` สร้าง URL จาก `req.get("host")` — Host Header Injection risk

### ⬜ ยังไม่พัฒนา
- Email Notification System
- Pagination บน list pages
- Search/Filter ขั้นสูง
- Mobile Responsive
- Testing (ทุกประเภท)
- Production Deployment

---

## 9. Infrastructure (Docker Compose)

| Service | Image | Port | Volume | Note |
|---------|-------|------|--------|------|
| `db` | mysql:8.0 | 3306:3306 | db_data + init.sql | ⚠️ port expose ออก host |
| `backend` | Node.js Dockerfile | 3000:3000 | uploads_data | ⚠️ JWT_SECRET hardcode |
| `frontend` | Nuxt Dockerfile | 8888:8888 | — | NUXT_INTERNAL_API_BASE ใน container |

### Environment Variables ที่สำคัญ
```bash
# Backend
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
PORT=3000
JWT_SECRET         ← ⚠️ hardcode ใน docker-compose.yml
JWT_EXPIRES_IN=1d
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  ← ยังไม่ใช้งาน
CORS_ORIGIN=http://localhost:8888

# Frontend (Nuxt runtime)
NUXT_INTERNAL_API_BASE=http://backend:3000/api/v1  ← SSR server-to-server
NUXT_PUBLIC_API_BASE=http://localhost:3000/api/v1   ← Browser
```

```bash
# Start all services
docker compose up --build

# Stop
docker compose down
```

---

## 10. TypeScript Types (Frontend)

| File | Interfaces |
|------|-----------|
| `auth.types.ts` | `RegisterForm`, `AuthResponse` |
| `user.types.ts` | `User` |
| `order.types.ts` | `WorkType`, `Package`, `OrderFormPayload`, `OrderCreateResponse`, `OrderStatus`, `OrderImage`, `Payment`, `WorkflowLog`, `OrderSummary`, `OrderDetail`, `UploadResponse` |

---

*วิเคราะห์จาก: database.sql, orderController.js, auth.controller.js, payment.controller.js, user.model.js, upload.controller.js, nuxt.config.ts, package.json (frontend+backend), docker-compose.yml, routes/v1/index.js และไฟล์ทั้งหมดใน controllers/, models/, pages/, components/*
