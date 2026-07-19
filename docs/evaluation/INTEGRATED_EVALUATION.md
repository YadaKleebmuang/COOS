# INTEGRATED SYSTEM EVALUATION REPORT — COOS Project

> **ประเภทการตรวจสอบ:** Static Code Review (ไม่ได้รันระบบจริง)
> **วันที่ประเมิน:** 20 กรกฎาคม 2026
> **เวอร์ชัน:** v0.6 (Sprint 4)
> **ผู้ประเมิน:** Senior Software Engineer / Software Architect / Security Reviewer / QA Engineer / UX-UI Reviewer

---

## 1. ผลรวมจากการประเมินแต่ละส่วน

| ส่วน | คะแนน | สถานะ | Deploy Ready |
|------|-------|-------|-------------|
| Frontend | 59/100 | MVP | ❌ (3 blockers) |
| Backend | 66/100 | MVP | ❌ (4 blockers) |
| **ระบบรวม** | **62/100** | **MVP** | **❌** |

---

## 2. การตรวจสอบการเชื่อมต่อ Frontend ↔ Backend

### 2.1 Auth Flow (Login → Token → Protected Routes)

**สถานะ: ✅ ทำงานได้ตามที่ออกแบบ**

Flow การทำงาน:
1. Frontend: login.vue → authService.login() → POST /api/v1/auth/login
2. Backend: auth.controller.js → bcrypt.compare() → jwt.sign()
3. Backend: ส่ง token กลับ
4. Frontend: เก็บ token ใน cookie "token", เก็บ role ใน cookie "userRole"
5. Frontend: useApi.ts อ่าน token จาก useCookie แล้วส่ง Authorization: Bearer header

**ปัญหาที่พบ:**
- Frontend set httpOnly: true ใน useCookie แต่ไม่มีผลจริงฝั่ง client (ISSUE-FE-002)
- Admin middleware verify กับ backend แต่ customer/editor ไม่ verify (ISSUE-FE-001)

---

### 2.2 Order Creation Flow

**สถานะ: ✅ ทำงานได้ตามที่ออกแบบ**

Flow การทำงาน:
1. Frontend: create.vue เลือก workType + package → fetchWorkTypes(), fetchPackages() → GET /work-types, GET /packages
2. Frontend: กรอก form → submitOrder() → POST /orders payload
3. Backend: orderController.create() — ตรวจ session, ดึง package จาก DB, คำนวณราคา, สร้าง order + log ใน transaction
4. Frontend: redirect ไปหน้า order detail

**Frontend ↔ Backend Contract:**
- Frontend ส่ง: { packageId, workTypeId, orderRequiredDate, orderIsUrgent, orderIsGalleryAllowed, sourceImageUrls? }
- Backend คาดหวัง: เหมือนกัน (ตรงกัน ✅)

**ปัญหาที่พบ:**
- Frontend คำนวณ price preview เองด้วย client-side logic แต่ราคาจริงคำนวณที่ backend — ดี (backend is source of truth) แต่อาจทำให้ user งงถ้า preview ไม่ตรงกับ final price

---

### 2.3 File Upload Flow

**สถานะ: ⚠️ มีปัญหา**

Flow การทำงาน:
1. Frontend: uploadSourceImages() → POST /upload/source/multiple (FormData with "images" field)
2. Backend: uploadSource.array("images", 10) → validateMagicBytes → uploadMultiple()
3. Backend: return { files: [{ url, filename, ... }] }

**ปัญหาที่พบ:**
- ISSUE-BE-002: upload.controller.js มี `next` undeclared — ถ้า error เกิดขึ้นจะ crash
- ISSUE-BE-010: BACKEND_URL ไม่ได้ set ใน docker-compose → URL ที่ส่งกลับจะเป็น localhost:3000 ซึ่ง browser ไม่สามารถเข้าถึงได้
- ผลลัพธ์: หน้า create.vue จะแสดงรูปภาพผิดพลาดเมื่อรันผ่าน Docker

---

### 2.4 Payment Flow

**สถานะ: ✅ ทำงานได้ตามที่ออกแบบ**

Flow การทำงาน:
1. Customer อัปโหลด slip → POST /upload/slip
2. Customer ส่ง slip URL → POST /orders/:id/payments
3. Backend: ตรวจ duplicate payment, ตรวจ amount ± 1 บาท, บันทึก
4. Admin: GET /payments → approve/reject → PATCH /payments/:id/approve
5. Backend: OrderModel.verifyPayment() → update payment status + auto-transition order status

**Frontend ↔ Backend Contract:**
- Frontend ส่ง: { paymentType, paymentAmount, paymentSlipUrl }
- Backend คาดหวัง: เหมือนกัน (ตรงกัน ✅)

**ปัญหาที่พบ:**
- Payment amount คำนวณใน frontend (30% หรือ 70% ของ total) — backend ไม่ validate ว่า amount ถูกต้องหรือไม่ตาม business rule อย่างเคร่งครัด เพียงตรวจ ± 1 บาท ซึ่งอาจ bypass ได้

---

### 2.5 Admin Authorization Chain

**สถานะ: ✅ ดีที่สุดในระบบ**

Chain การ verify:
1. Frontend: admin.ts middleware → check userRole cookie
2. Frontend: double-check กับ GET /users/me
3. Backend: authMiddleware → verify JWT → set req.session
4. Backend: adminOnly middleware → check req.session.userRole === "admin"
5. Backend: route handler ทำงาน

Double-check ทั้ง frontend และ backend ทำให้ admin routes มีความปลอดภัยสูง

---

### 2.6 Editor และ Customer Authorization Chain

**สถานะ: ⚠️ ไม่สมบูรณ์ที่ Frontend**

- Frontend customer/editor middleware ตรวจแค่ cookie — สามารถ bypass ได้
- Backend มีการ check role ใน controller แต่ไม่สม่ำเสมอทุก endpoint
- Orders endpoint: GET /orders ตรวจ role เพื่อ filter แต่ไม่ได้ protect ด้วย middleware ระดับ route

---

### 2.7 SSR (Server-Side Rendering) Compatibility

**สถานะ: ✅ รองรับแล้ว**

useApi.ts มีการตรวจสอบ:
```typescript
const baseUrl = import.meta.server
  ? (process.env.NUXT_INTERNAL_API_BASE || config.public.apiBase)
  : config.public.apiBase;
```

- SSR ใช้ NUXT_INTERNAL_API_BASE = http://backend:3000/api/v1 (docker internal)
- Browser ใช้ NUXT_PUBLIC_API_BASE = http://localhost:3000/api/v1 (public)

**ปัญหาที่พบ:**
- docker-compose.yml set NUXT_INTERNAL_API_BASE ถูกต้อง
- แต่ NUXT_PUBLIC_API_BASE hardcode ใน nuxt.config.ts เป็น localhost:3000 — ต้องเปลี่ยนเมื่อ deploy บน server จริง

---

### 2.8 Error Propagation Chain

**สถานะ: ✅ ครบถ้วนสม่ำเสมอ**

- Backend: Controllers ส่ง error ผ่าน next(err) → global error handler → JSON response { code, message }
- Frontend: useApi.ts catch → throw ApiError(statusCode, message)
- Frontend: Pages catch ApiError → แสดง error message ใน template

Chain ทำงานได้ดี แต่:
- upload.controller.js ยังไม่มี next parameter (ISSUE-BE-002) ทำให้ chain ขาด
- admin/payments.vue ใช้ alert() แทน error ref (ISSUE-FE-004)

---

## 3. ปัญหาเฉพาะระบบรวม (Integration Issues)

### INT-001: Payment Amount Business Rule ไม่ consistent

- **Severity:** High
- **Frontend:** customer/orders/[id].vue คำนวณ amount เองใน client: total * 0.3 (deposit), total * 0.7 (final)
- **Backend:** orderController.submitPayment() ตรวจว่า Math.abs(paymentAmount - expectedAmount) > 1
- **Problem:** expectedAmount ใน backend คำนวณจาก `order.orderTotalPrice * depositPercentage` ซึ่ง depositPercentage มาจาก systemSettings แต่ frontend hardcode เป็น 0.3 และ 0.7
- **Risk:** ถ้า Admin เปลี่ยน depositPercentage ใน settings จะทำให้ frontend ส่ง amount ผิดและ backend reject
- **Recommended Fix:** Frontend ควรดึง depositPercentage จาก systemSettings endpoint แทนการ hardcode

---

### INT-002: Static Files URL ไม่สม่ำเสมอ

- **Severity:** High
- **Frontend:** gallery.vue, index.vue ใช้ imageUrl โดยตรงจาก API (อาจเป็น /uploads/gallery/file.jpg)
- **Backend:** galleryImage.controller.js สร้าง imageUrl เป็น `/uploads/gallery/${req.file.filename}` (relative path)
- **Backend:** upload.controller.js สร้าง URL เป็น absolute (BACKEND_URL + /uploads/)
- **Problem:** URL format ไม่สม่ำเสมอ — gallery images เป็น relative path, uploaded files เป็น absolute
- **Frontend:** ใช้ `<img :src="imageUrl">` โดยตรง — ถ้า relative path จะ resolve กับ frontend URL แทน backend URL
- **Recommended Fix:** สร้าง convention ว่า imageUrl ต้องเป็น absolute URL เสมอ

---

### INT-003: Nuxt Config apiBase Hardcode

- **Severity:** Medium
- **File/Module:** frontend/nuxt.config.ts บรรทัด 44
- **Problem:** apiBase: "http://localhost:3000/api/v1" hardcode ใน config — ถ้า deploy บน server จริง จะต้องแก้ทุกครั้ง
- **Recommended Fix:** ใช้ NUXT_PUBLIC_API_BASE env variable แทน hardcode

---

### INT-004: Order Status Display ไม่ Match กับ Backend Business Logic บางกรณี

- **Severity:** Low
- **Frontend:** customer/orders/[id].vue แสดง payment form เมื่อ orderStatus === "waiting_final_payment"
- **Backend:** payment flow เปลี่ยน status เป็น waiting_final_payment หลัง editor เลือกภาพสุดท้าย (waiting_selection → waiting_final_payment) ซึ่งยังไม่มี UI ให้ editor กด
- **Problem:** Editor ยังไม่มี UI action ที่ trigger การ transition จาก waiting_selection → waiting_final_payment
- **Recommended Fix:** เพิ่มปุ่มใน editor job workspace เพื่อ submit final images และ trigger status change

---

## 4. Security Assessment (ระบบรวม)

| ด้าน | สถานะ | ระดับ |
|------|-------|-------|
| JWT Authentication | ✅ bcrypt + JWT verify | ดี |
| Admin Authorization | ✅ double-check Frontend + Backend | ดี |
| Customer/Editor Authorization | ⚠️ Frontend cookie-only | ต้องแก้ |
| File Upload Security | ✅ MIME + Magic Bytes | ดี |
| Rate Limiting | ✅ Global + Auth-specific | ดี |
| SQL Injection | ⚠️ Parameterized queries ดี แต่ report controller interpolation | ต้องดูแล |
| XSS Prevention | ⚠️ ไม่มี CSP header | ต้องแก้ |
| CSRF Protection | ❌ ไม่มี CSRF token | ต้องแก้ |
| Secret Management | ❌ .env commit เข้า git | Critical — ต้องแก้ทันที |
| Security Headers | ❌ ขาด Helmet | ต้องแก้ |
| Token Revocation | ❌ ไม่มี blacklist | ต้องแก้ |

---

## 5. Infrastructure Assessment

| ด้าน | สถานะ | หมายเหตุ |
|------|-------|---------|
| Docker Compose | ✅ MySQL + Backend + Frontend ครบ | |
| Database Health Check | ✅ มี healthcheck + retry | |
| Volume Persistence | ✅ db_data, uploads_data | |
| Internal Networking | ✅ backend → db ผ่าน container name | |
| BACKEND_URL | ❌ ไม่ได้ set | File URL จะ invalid |
| NUXT_PUBLIC_API_BASE | ⚠️ Hardcode ใน nuxt.config.ts | ต้องแก้เพื่อ production |
| Production Build | ⚠️ Frontend ยังใช้ dev server (port 8888) | ต้องตรวจสอบ Dockerfile |

---

## 6. Combined Issues Master List

| ID | Severity | Layer | ชื่อปัญหา |
|----|----------|-------|---------|
| ISSUE-BE-001 | Critical | Backend | .env commit เข้า git |
| ISSUE-BE-002 | Critical | Backend | upload.controller undeclared next |
| INT-001 | High | Integration | Payment amount business rule ไม่ consistent |
| INT-002 | High | Integration | Static file URL format ไม่สม่ำเสมอ |
| ISSUE-FE-001 | High | Frontend | customer/editor middleware ไม่ verify backend |
| ISSUE-FE-002 | High | Frontend | httpOnly cookie ไม่มีผลจริง |
| ISSUE-BE-003 | High | Backend | ขาด Security Headers |
| ISSUE-BE-005 | High | Backend | ขาด Request Body Size Limit |
| ISSUE-BE-006 | High | Backend | ขาด Pagination |
| ISSUE-BE-007 | High | Backend | Mass Assignment ใน gallery update |
| ISSUE-FE-003 | High | Frontend | ขาด Pagination |
| INT-003 | Medium | Integration | Nuxt apiBase hardcode |
| ISSUE-BE-009 | Medium | Backend | ขาด JWT Revocation |
| ISSUE-BE-010 | Medium | Backend/Infra | BACKEND_URL ไม่ได้ set ใน docker-compose |
| INT-004 | Low | Integration | Editor ไม่มี UI transition waiting_selection → waiting_final_payment |

---

## 7. Final Scores

| ส่วน | คะแนน | Grade |
|------|-------|-------|
| Frontend | 59/100 | D+ |
| Backend | 66/100 | C+ |
| Integration | 55/100 | D+ |
| **ระบบรวม** | **62/100** | **C** |

---

## 8. Deploy Blockers (ทั้งระบบ)

| ลำดับ | Issue | เหตุผล |
|-------|-------|-------|
| 1 | BE-001 | JWT Secret ใน git — ความเสี่ยงสูงสุด |
| 2 | BE-002 | Upload crash ใน production |
| 3 | BE-010 / INT-002 | File URL ที่ return กลับ invalid ใน Docker |
| 4 | FE-001 | Customer/Editor route bypass ได้ด้วย cookie manipulation |
| 5 | INT-001 | depositPercentage hardcode อาจทำให้ payment reject ผิดพลาด |
| 6 | ไม่มี Test | Frontend + Backend ไม่มี test ครอบคลุม |

---

## 9. Overall Roadmap

### Priority 0 — แก้ทันทีก่อน merge

1. BE-001: เพิ่ม backend/.env ใน .gitignore + rotate secrets
2. BE-002: แก้ upload.controller.js ให้มี next parameter

### Priority 1 — Sprint 4 (Security)

3. BE-003: เพิ่ม Helmet
4. BE-005: เพิ่ม body size limit
5. BE-007: whitelist fields ใน gallery update
6. FE-001: แก้ customer/editor middleware
7. BE-010: เพิ่ม BACKEND_URL ใน docker-compose
8. INT-002: Standardize file URL format

### Priority 2 — Sprint 4 (Functionality)

9. BE-006 + FE-003: เพิ่ม Pagination ทั้ง Frontend และ Backend
10. INT-001: แก้ depositPercentage hardcode
11. INT-003: เปลี่ยน apiBase เป็น env variable

### Priority 3 — Sprint 5 (Quality)

12. เพิ่ม Frontend Tests (Vitest + Playwright)
13. เพิ่ม Backend Tests (Jest + Supertest)
14. FE-002: แก้ httpOnly cookie
15. BE-009: Token revocation
16. INT-004: Editor UI สำหรับ final image submission

---

## 10. Final Verdict

**คะแนนระบบรวม: 62/100**
**สถานะ: MVP — ใช้งานได้ในสภาพแวดล้อม Development**

ระบบ COOS มีโครงสร้างที่ดีและ Feature ครอบคลุม แสดงให้เห็นถึงความตั้งใจในการออกแบบและการพัฒนาที่มีคุณภาพสำหรับ Solo Project

**ก่อน Production Deploy ต้องแก้ไข:**
- ปัญหา Critical 2 รายการ (BE-001, BE-002)
- ปัญหา Integration 2 รายการ (INT-001, INT-002)
- ปัญหา Security High 2 รายการ (FE-001, BE-003)
- เพิ่ม Test Coverage ทั้ง Frontend และ Backend

---

*รายงานนี้เป็น Static Code Review — ไม่ได้รันระบบจริง*
*วันที่สร้าง: 20 กรกฎาคม 2026*
