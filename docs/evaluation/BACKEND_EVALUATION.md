# BACKEND EVALUATION REPORT — COOS Project

> **ประเภทการตรวจสอบ:** Static Code Review (ไม่ได้รันระบบจริง)
> **วันที่ประเมิน:** 20 กรกฎาคม 2026
> **เวอร์ชัน:** v0.6 (Sprint 4)
> **ผู้ประเมิน:** Senior Software Engineer / Security Reviewer / QA Engineer

---

## 1. Scope และสิ่งที่ตรวจสอบ

| หมวด | ไฟล์ / โมดูล |
|------|-------------|
| Entry Point | src/server.js, src/app.js |
| Config | config/db.js, config/upload.js, backend/.env |
| Middleware | auth.middleware.js, admin.middleware.js, cors.middleware.js, rateLimit.middleware.js, upload.middleware.js, error.middleware.js |
| Routes | routes/v1/index.js + 13 route files |
| Controllers | controllers/ (13 files) |
| Models | models/ (9 files) |
| Database | backend/database.sql (12 tables) |
| Tests | tests/orderController.spec.js |
| Infrastructure | docker-compose.yml, Dockerfile, .env |

---

## 2. Executive Summary

Backend ของ COOS พัฒนาด้วย **Node.js + Express 5 + MySQL 8 + JWT** มีโครงสร้าง MVC ที่ชัดเจน

**จุดแข็ง:**
- Rate Limiting มีทั้ง Global และ Auth-specific limiter
- Order State Machine ครบและมี validation ที่ดี
- Transaction ใน critical operations (create order, verify payment, assign editor)
- Magic Bytes validation ป้องกัน file spoofing
- Duplicate payment check และ payment amount validation (1 บาท tolerance) ครบ
- Error handling ผ่าน global error middleware

**จุดอ่อน:**
- .env file ถูก commit เข้า git repository (Critical)
- JWT_SECRET ถูก expose ใน .env ที่ commit แล้ว (Critical)
- upload.controller.js มี `return next(err)` แต่ `next` ไม่ถูก declare ใน function signature (Critical Bug)
- ขาด Security Headers (Helmet)
- ขาด Request Body Size Limit
- Test ครอบคลุมเพียง orderController เท่านั้น

---

## 3. Architecture Summary

MVC separation ชัดเจน Business logic อยู่ใน controller/model ที่เหมาะสม authMiddleware ถูก apply globally ใน routes/v1/index.js

**โครงสร้างหลัก:**
- app.js — Express setup + global rate limit + static files serving
- config/db.js — MySQL Pool (connection retry 10 ครั้ง) ดี
- config/upload.js — Multer config (5 storage types, MIME filter) ดี
- middlewares/ — 8 middleware files ครบ
- controllers/ — 13 controllers ครบ
- models/ — 9 models ครบ
- routes/v1/ — 14 route files ครบ

---

## 4. API และ Business Logic Status

| Feature | Endpoint | สถานะ |
|---------|----------|-------|
| Register | POST /auth/register | ✅ role hardcode = customer (ดี) |
| Login | POST /auth/login | ✅ bcrypt + JWT |
| Forgot Password | POST /auth/forgot-password | ✅ enumeration-safe |
| Reset Password | POST /auth/reset-password | ✅ token expire check |
| Create Order | POST /orders | ✅ price calc at server, transaction |
| Get Orders | GET /orders | ✅ role-filtered |
| Update Status | PATCH /orders/:id/status | ✅ state machine validated |
| Assign Editor | PATCH /orders/:id/assign | ✅ role check |
| Submit Payment | POST /orders/:id/payments | ✅ duplicate + amount validation |
| Verify Payment | PATCH /orders/:id/payments/:id | ✅ auto-transition |
| Admin Payments | GET/PATCH /payments | ✅ adminOnly middleware |
| File Upload | POST /upload/* | ✅ MIME + magic bytes |
| Gallery CRUD | /gallery-images | ✅ tag support |
| Reports | GET /reports | ✅ 6 KPIs |
| Settings | GET/PATCH /settings | ✅ adminOnly |

---

## 5. Evaluation Scores

| ด้าน | คะแนนเต็ม | คะแนนที่ได้ | เหตุผล |
|------|:---------:|:-----------:|-------|
| Architecture | 15 | 11 | MVC ชัดเจน, Middleware chain ดี, ขาด Repository layer |
| API และ Business Logic | 20 | 15 | State machine ดี, Transaction ครบ, ขาด pagination |
| Authentication และ Security | 20 | 10 | Rate limit ดี, Magic bytes ดี, .env commit (Critical), ขาด Helmet |
| Database และ Data Integrity | 15 | 12 | Schema ดี, FK ครบ, Transaction ครบ, ขาด index บาง FK column |
| Validation และ Error Handling | 10 | 7 | Validation พื้นฐานครบ, ขาด schema validation library |
| Code Quality และ Maintainability | 10 | 7 | อ่านง่าย, Naming ดี, มี bug ใน upload.controller |
| Performance | 5 | 3 | Connection pooling มี, ขาด Pagination |
| Testing และ Backend Readiness | 5 | 1 | มีเฉพาะ orderController unit test — ไม่ครบ |
| **รวม** | **100** | **66** | |

**สถานะ Backend: MVP** (มีปัญหา Security Critical ที่ต้องแก้ก่อน Deploy)

---

## 6. Issues Summary

| ID | Severity | Category | ชื่อปัญหา |
|----|----------|----------|---------|
| ISSUE-BE-001 | Critical | Security | .env ถูก commit เข้า git — JWT Secret / DB Password รั่ว |
| ISSUE-BE-002 | Critical | Bug | upload.controller.js มี undeclared `next` parameter |
| ISSUE-BE-003 | High | Security | ขาด Security Headers (Helmet) |
| ISSUE-BE-004 | High | Security | CORS fallback origin ขาด URL validation |
| ISSUE-BE-005 | High | Security/DoS | ขาด Request Body Size Limit |
| ISSUE-BE-006 | High | Performance | ขาด Pagination ใน GET /orders และ GET /users |
| ISSUE-BE-007 | High | Security | galleryImage.controller ส่ง req.body ทั้งหมดไปยัง model (Mass Assignment) |
| ISSUE-BE-008 | Medium | Security | Report Controller มี date filter interpolation ใน SQL string |
| ISSUE-BE-009 | Medium | Auth | ไม่มี JWT Token Revocation — logout เป็น client-side only |
| ISSUE-BE-010 | Medium | Config | upload.controller.js ใช้ BACKEND_URL แต่ docker-compose ไม่ได้ set |
| ISSUE-BE-011 | Medium | Validation | ไม่มี Validation library (zod, joi) |
| ISSUE-BE-012 | Low | Quality | console.error ใน payment.controller ที่ไม่สม่ำเสมอ |
| ISSUE-BE-013 | Low | Performance | ขาด Database Index บน payments.orderId, orderImages.orderId |
| ISSUE-BE-014 | Low | Testing | Test coverage ต่ำมาก |

---

## 7. Detailed Issues

### ISSUE-BE-001: .env ถูก Commit เข้า Git — JWT Secret / DB Password รั่ว

- **Severity:** Critical
- **Category:** Security — Secret Leakage
- **File/Module:** backend/.env, .gitignore
- **Problem:** ไฟล์ backend/.env ถูก commit เข้า git repository ทำให้ JWT_SECRET และ DB_PASSWORD ถูก expose ใน git history ทั้งหมด
- **Evidence:**
  - backend/.env มี JWT_SECRET=f759ea4bd246ed7ec8119c123b9b163a0860dd3accd22764a5263f88110b4ef8
  - backend/.env มี DB_PASSWORD=root1234
  - docs/ai/03_PROJECT_STATE.md ระบุว่า "backend/.env ถูก commit เข้า git" เป็น Known Issue ที่ยังไม่แก้
- **Root Cause:** ไม่มี backend/.env ใน .gitignore
- **Impact:** ผู้ที่มีสิทธิ์เข้าถึง git repo สามารถนำ JWT_SECRET ไป forge JWT token ที่ถูกต้องสมบูรณ์ได้ และเข้าถึง database โดยตรง
- **Recommended Fix:**
  1. เพิ่ม backend/.env ใน .gitignore ทันที
  2. Rotate JWT_SECRET และ DB_PASSWORD ทันที
  3. ใช้ git filter-branch หรือ BFG Repo-Cleaner เพื่อลบ .env จาก git history
  4. สร้าง backend/.env.example ที่มีเฉพาะ key template
- **Migration Required:** Yes — เปลี่ยน JWT_SECRET ต้อง logout ผู้ใช้ทั้งหมด
- **Priority:** P0 — ต้องแก้ก่อนทุกอย่าง

---

### ISSUE-BE-002: upload.controller.js มี Undeclared `next` Parameter

- **Severity:** Critical
- **Category:** Code Bug — Runtime Crash
- **File/Module:** backend/src/controllers/upload.controller.js
- **Line/Function/Route:** บรรทัด 8 (uploadSingle), บรรทัด 36 (uploadMultiple)
- **Problem:** ฟังก์ชัน uploadSingle และ uploadMultiple ถูก define เป็น (req, res) แต่ catch block เรียก return next(err) ซึ่ง next ไม่ได้ถูก declare
- **Evidence:**

```javascript
// upload.controller.js บรรทัด 8
exports.uploadSingle = (req, res) => {
  try {
    ...
  } catch (err) {
    return next(err);  // ReferenceError: next is not defined
  }
};
```

- **Root Cause:** ผู้พัฒนาลืม declare next ใน function signature
- **Impact:** หาก error เกิดขึ้นใน try block จะ throw ReferenceError ทำให้ server ตอบสนองผิดปกติ
- **Recommended Fix:** เปลี่ยน function signature เป็น (req, res, next) ทั้งสองฟังก์ชัน
- **Migration Required:** No
- **Priority:** P0

---

### ISSUE-BE-003: ขาด Security Headers (Helmet)

- **Severity:** High
- **Category:** Security
- **File/Module:** backend/src/app.js
- **Problem:** ไม่มี helmet middleware ทำให้ขาด security headers: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy
- **Recommended Fix:**
  - npm install helmet
  - เพิ่ม app.use(helmet()) ใน app.js ก่อน routes
- **Priority:** P1

---

### ISSUE-BE-004: CORS Config ขาด URL Validation

- **Severity:** High
- **Category:** Security
- **File/Module:** backend/src/middlewares/cors.middleware.js
- **Problem:** ถ้า CORS_ORIGIN env ไม่ได้ set จะ fallback เป็น localhost:8888 เท่านั้น (ดี) แต่ไม่มี validation ว่า origin ใน CORS_ORIGIN list เป็น URL ที่ valid
- **Risk:** ถ้า CORS_ORIGIN ถูก set ผิดพลาดอาจยอมรับ origin ที่ไม่ตั้งใจ
- **Recommended Fix:** เพิ่ม URL format validation ก่อน parse CORS_ORIGIN

---

### ISSUE-BE-005: ขาด Request Body Size Limit

- **Severity:** High
- **Category:** Security / DoS
- **File/Module:** backend/src/app.js
- **Problem:** app.use(express.json()) ไม่กำหนด limit — ผู้โจมตีส่ง JSON body ขนาดใหญ่มากทำให้ server ใช้ memory จนตาย
- **Recommended Fix:** app.use(express.json({ limit: '1mb' }))

---

### ISSUE-BE-006: ขาด Pagination ใน GET /orders และ GET /users

- **Severity:** High
- **Category:** Performance / API Design
- **File/Module:** backend/src/models/orderModel.js, user.model.js
- **Problem:** findAll() ดึงทุก record โดยไม่มี LIMIT/OFFSET
- **Recommended Fix:** เพิ่ม ?page=&limit= parameter และ return { data, total, page, limit }

---

### ISSUE-BE-007: Mass Assignment ใน galleryImage.controller Update

- **Severity:** High
- **Category:** Security
- **File/Module:** backend/src/controllers/galleryImage.controller.js บรรทัด 102
- **Problem:** GalleryImageModel.update(id, req.body) ส่ง req.body ทั้งหมดโดยไม่มีการ whitelist fields
- **Evidence:**

```javascript
// galleryImage.controller.js บรรทัด 102
const result = await GalleryImageModel.update(id, req.body);
```

- **Impact:** ผู้ใช้ส่ง field เช่น imageCreatedAt, imageId ใน body เพื่อแก้ค่าที่ไม่ควรแก้ได้
- **Recommended Fix:**

```javascript
const { imageUrl, workTypeId, imageTitle, imageDescription, imageIsActive, imageTags } = req.body;
const result = await GalleryImageModel.update(id, { imageUrl, workTypeId, imageTitle, imageDescription, imageIsActive, imageTags });
```

---

### ISSUE-BE-008: SQL Interpolation ใน Report Controller

- **Severity:** Medium
- **Category:** Security — Potential SQL Injection
- **File/Module:** backend/src/controllers/report.controller.js บรรทัด 10-12, 56
- **Problem:** dateFilter ถูก interpolate เข้าไปใน SQL query โดยตรง และบรรทัด 56 ใช้ .replace() บน string ที่ interpolate แล้ว
- **Evidence:**

```javascript
dateFilter = "AND orderCreatedAt >= ? AND orderCreatedAt <= ?";
`SELECT ... FROM orders WHERE 1=1 ${dateFilter}` // template literal interpolation
```

- **Risk:** ปัจจุบันปลอดภัยเพราะ dateFilter เป็น hardcode string แต่บรรทัด 56 อาจเปลี่ยนไปได้
- **Recommended Fix:** ใช้ conditional WHERE clauses แทน string interpolation

---

### ISSUE-BE-009: ไม่มี JWT Token Revocation

- **Severity:** Medium
- **Category:** Authentication
- **Problem:** Logout เป็น client-side เท่านั้น (ล้าง cookie) ไม่มี blacklist ที่ backend ทำให้ token ที่ expire ยังใช้ได้
- **Impact:** ถ้า token ถูกขโมย ผู้โจมตียังใช้ได้จนกว่าจะ expire (1 วัน per JWT_EXPIRES_IN=1d)
- **Recommended Fix:** Redis-based token blacklist หรือ short-lived token + refresh token

---

### ISSUE-BE-010: BACKEND_URL ไม่ได้ Set ใน Docker Compose

- **Severity:** Medium
- **Category:** Configuration
- **File/Module:** backend/src/controllers/upload.controller.js, docker-compose.yml
- **Problem:** upload.controller ใช้ process.env.BACKEND_URL แต่ docker-compose.yml ไม่ได้ set BACKEND_URL ทำให้ fallback เป็น http://localhost:3000
- **Evidence:**

```javascript
const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
```

- **Impact:** File URL จาก upload จะเป็น http://localhost:3000/uploads/... ซึ่ง browser ไม่สามารถเข้าถึงได้จาก container
- **Recommended Fix:** เพิ่ม BACKEND_URL=http://localhost:3000 ใน docker-compose.yml environment

---

### ISSUE-BE-011 ถึง ISSUE-BE-014

- **BE-011:** ขาด Validation library — Manual if/check เสี่ยง miss case — ใช้ zod หรือ joi
- **BE-012:** console.error ใน rejectPayment (payment.controller.js บรรทัด 77) — ไม่สม่ำเสมอ
- **BE-013:** ขาด index บน payments.orderId และ orderImages.orderId ใน database.sql
- **BE-014:** Test ครอบคลุมแค่ orderController.create (4 cases) และ isValidTransition — ไม่มี auth, payment, upload test

---

## 8. Recommended Fixes (สรุป)

| ลำดับ | Issue | ความยาก | ผลกระทบ |
|-------|-------|---------|---------|
| 1 | BE-001: ลบ .env จาก git, rotate secrets | กลาง | Critical |
| 2 | BE-002: เพิ่ม next parameter ใน upload controller | ต่ำ | Critical |
| 3 | BE-003: เพิ่ม helmet | ต่ำ | High |
| 4 | BE-005: เพิ่ม body size limit | ต่ำ | High |
| 5 | BE-007: whitelist fields ใน gallery update | ต่ำ | High |
| 6 | BE-006: เพิ่ม Pagination | กลาง | High |
| 7 | BE-010: เพิ่ม BACKEND_URL ใน docker-compose | ต่ำ | Medium |

---

## 9. Testing Recommendations

ปัจจุบันมีเพียง 1 test file ควรเพิ่ม:

1. Auth Tests: register, login, forgotPassword, resetPassword
2. Payment Tests: submitPayment (duplicate, wrong amount, correct)
3. Upload Tests: valid image, fake extension, oversized
4. Authorization Tests: customer accessing admin endpoint
5. Integration Tests (Supertest): Full flow create order → pay → approve → complete

---

## 10. Remediation Roadmap

- Phase 1 (Immediate): BE-001, BE-002 — Critical security fixes
- Phase 2 (Sprint 4): BE-003, BE-005, BE-007 — Security hardening
- Phase 3 (Sprint 4): BE-006 — Pagination
- Phase 4 (Sprint 5): BE-008, BE-011 — Validation improvement
- Phase 5 (Sprint 5): BE-009 — Token revocation
- Phase 6 (Sprint 5): BE-013, BE-014 — Performance + Testing

---

## 11. Deploy Blockers

| # | Issue | เหตุผล |
|---|-------|-------|
| 1 | BE-001 | JWT Secret / DB Password รั่วใน git history |
| 2 | BE-002 | Upload controller crash ด้วย ReferenceError ใน error case |
| 3 | BE-010 | File URL จาก upload invalid ใน docker environment |
| 4 | ขาด Test | ไม่สามารถพิสูจน์ความถูกต้องของ API ได้ |

---

## 12. Final Verdict

**คะแนน Backend: 66/100**
**สถานะ: MVP**

- จุดแข็ง: MVC ชัดเจน, State machine ดี, Transaction ครบ, Rate limit มี, Magic bytes validation ดี
- จุดอ่อน: .env commit (Critical), upload bug, ขาด Helmet, ขาด Pagination, Test น้อยมาก
- Deploy Blockers: 4 รายการ

---

## 13. File References

- backend/src/app.js — Express setup
- backend/src/controllers/orderController.js — State machine + Price calc (ดี)
- backend/src/controllers/upload.controller.js — Bug: undeclared next (ต้องแก้)
- backend/src/controllers/galleryImage.controller.js — Mass assignment risk (ต้องแก้)
- backend/src/controllers/report.controller.js — SQL interpolation risk
- backend/src/middlewares/rateLimit.middleware.js — Rate limiting (ดี)
- backend/src/middlewares/upload.middleware.js — Magic bytes validation (ดี)
- backend/src/models/orderModel.js — Transactions (ดี)
- backend/database.sql — Schema (12 tables, ครบ)
- backend/.env — JWT Secret exposed (Critical)
- docker-compose.yml — BACKEND_URL missing

---

## 14. Unable to Verify

- Email System: SMTP config มี แต่ไม่ได้รัน transporter จริง
- Performance under load: ไม่ได้ทำ load test
- DB connection pool behavior: ไม่ได้รันจริง
- npm test execution: ไม่ได้รัน

---

*รายงานนี้เป็น Static Code Review — ไม่ได้รันระบบจริง*
*วันที่สร้าง: 20 กรกฎาคม 2026*
