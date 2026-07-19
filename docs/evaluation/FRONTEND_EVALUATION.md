# FRONTEND EVALUATION REPORT — COOS Project

> **ประเภทการตรวจสอบ:** Static Code Review (ไม่ได้รันระบบจริง)
> **วันที่ประเมิน:** 20 กรกฎาคม 2026
> **เวอร์ชัน:** v0.6 (Sprint 4)
> **ผู้ประเมิน:** Senior Software Engineer / UX-UI Reviewer / Security Reviewer

---

## 1. Scope และสิ่งที่ตรวจสอบ

| หมวด | ไฟล์ / โมดูล |
|------|-------------|
| Framework & Config | nuxt.config.ts, package.json |
| API Layer | composables/useApi.ts, services/auth.service.ts, services/order.service.ts |
| Middleware | middleware/auth.ts, admin.ts, customer.ts, editor.ts, guest.ts |
| Types | types/auth.types.ts, types/order.types.ts, types/user.types.ts |
| Pages | ทุกหน้าใน pages/ (public, admin x13, customer x3, editor x3) |
| Components | components/admin/ (10), components/editor/job/ (8), components/layout/ |
| Layouts | layouts/default.vue, auth.vue, admin.vue, customer.vue, editor.vue |

---

## 2. Executive Summary

Frontend ของ COOS พัฒนาด้วย **Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS** มีโครงสร้างที่ชัดเจนและ feature-based organization ที่ดี

**จุดแข็ง:**
- API composable (useApi.ts) มี error handling ที่ครบและรองรับ SSR
- Route Guard ของ Admin มีการ double-check กับ Backend API
- Form ป้องกัน Double Submit ด้วย submitting.value flag
- TypeScript Interface ครอบคลุม domain types ที่สำคัญ
- Loading / Error / Empty State ครบในหลายหน้า

**จุดอ่อน:**
- customer.ts และ editor.ts middleware ตรวจสอบเพียง cookie โดยไม่ verify กับ backend
- JWT Cookie ถูก set โดย useCookie ซึ่งไม่สามารถตั้ง httpOnly: true จาก client side ได้จริง
- ไม่มี Test แม้แต่ไฟล์เดียวฝั่ง Frontend
- Pagination ไม่มีในรายการที่มีข้อมูลจำนวนมาก
- AuthResponse.user typed เป็น any

---

## 3. Architecture Summary

Feature-based layout ที่ชัดเจน แยก Service layer ออกจาก Components ดี แต่ขาด State Management library ซึ่งเหมาะสมสำหรับขนาดโปรเจกต์นี้

**โครงสร้างหลัก:**
- composables/useApi.ts — Fetch wrapper (SSR-aware, ApiError class) ดี
- services/auth.service.ts — Login / Register / Forgot / Reset
- services/order.service.ts — Order / Upload / Payment
- middleware/admin.ts — Cookie + Backend double-check (ดี)
- middleware/customer.ts — Cookie only (ต้องแก้)
- middleware/editor.ts — Cookie only (ต้องแก้)

---

## 4. Features และ Workflow Status

| Feature | สถานะ |
|---------|-------|
| Public Landing + Gallery | ✅ มี UI เชื่อม API จริง |
| Login / Register | ✅ ครบ |
| Forgot / Reset Password | ✅ UI ครบ (Email ยังไม่ทำงานจริง) |
| Customer Order Create (4 steps) | ✅ ครบ |
| Customer Order Detail + Payment | ✅ ครบ |
| Editor Job Workspace (6 tabs) | ✅ ครบ |
| Admin Dashboard | ✅ (แสดงจาก orders list ไม่ใช้ /reports) |
| Admin Orders/Payments/Users | ✅ ครบ |
| Admin Gallery/Policies/Settings | ✅ ครบ |
| Admin Reports | ✅ (ใช้ /reports endpoint) |
| Pagination | ❌ ไม่มี |
| Mobile Responsive | ⚠️ ไม่สมบูรณ์ |
| Frontend Tests | ❌ ไม่มีเลย |

---

## 5. Evaluation Scores

| ด้าน | คะแนนเต็ม | คะแนนที่ได้ | เหตุผล |
|------|:---------:|:-----------:|-------|
| Architecture | 15 | 11 | Feature-based ดี, Services layer ดี, ขาด State Management, บาง type ใช้ any |
| Functionality | 20 | 14 | Feature ครบใน UI, ขาด Pagination, middleware บาง role ไม่ verify backend |
| UX/UI และ Accessibility | 15 | 10 | Design ดูดี, Loading/Error state ครบ, ขาด Aria labels, Mobile ไม่ responsive |
| Code Quality และ Maintainability | 15 | 11 | Code อ่านง่าย, TypeScript ดี, create.vue ใหญ่เกิน (851 บรรทัด) |
| Security ฝั่ง Client | 10 | 5 | Admin double-check ดี แต่ customer/editor cookie-only, httpOnly ใช้ไม่ได้จริง |
| Performance | 10 | 6 | ไม่มี Pagination, ไม่มี cache, ไม่ใช้ NuxtImg |
| Testing | 10 | 0 | ไม่มี Frontend Test แม้แต่ไฟล์เดียว |
| Frontend Readiness | 5 | 2 | ยังไม่ Production ready — ขาด test, mobile, pagination |
| **รวม** | **100** | **59** | |

**สถานะ Frontend: MVP**

---

## 6. Issues Summary

| ID | Severity | Category | ชื่อปัญหา |
|----|----------|----------|---------|
| ISSUE-FE-001 | High | Security | customer/editor middleware ไม่ verify กับ Backend |
| ISSUE-FE-002 | High | Security | httpOnly: true ใน useCookie ไม่มีผลฝั่ง Client |
| ISSUE-FE-003 | High | Functionality | ไม่มี Pagination ใน List pages |
| ISSUE-FE-004 | Medium | UX/UI | alert() ใช้ใน admin/payments.vue แทน Toast |
| ISSUE-FE-005 | Medium | Code Quality | create.vue มี 851 บรรทัด — ควรแยก Step Components |
| ISSUE-FE-006 | Medium | Type Safety | AuthResponse.user typed เป็น any |
| ISSUE-FE-007 | Medium | UX | Upload error ไม่ reset เมื่อเปลี่ยนไฟล์ใหม่ |
| ISSUE-FE-008 | Medium | Accessibility | ขาด aria-label, role, for attribute ในหลายส่วน |
| ISSUE-FE-009 | Low | Performance | ไม่ใช้ NuxtImg ในหลายที่ |
| ISSUE-FE-010 | Low | Quality | axios และ better-sqlite3 ใน dependencies แต่ไม่ได้ใช้ |
| ISSUE-FE-011 | Low | UX | ไม่มี Confirmation dialog เมื่อลบข้อมูลในบางหน้า |
| ISSUE-FE-012 | Low | Architecture | Admin Dashboard ไม่ใช้ /reports endpoint |

---

## 7. Detailed Issues

### ISSUE-FE-001: Customer/Editor Middleware ไม่ Verify กับ Backend

- **Severity:** High
- **Category:** Security / Authorization
- **File/Module:** frontend/app/middleware/customer.ts, editor.ts
- **Line/Function/Route:** บรรทัด 1-7 ของทั้งสองไฟล์
- **Problem:** Middleware ของ customer และ editor ตรวจสอบเพียงค่า userRole จาก cookie เท่านั้น โดยไม่มีการ verify กับ Backend API
- **Evidence (customer.ts):**

```typescript
export default defineNuxtRouteMiddleware(() => {
  const userRole = useCookie("userRole");
  if (userRole.value !== "customer") {
    return navigateTo("/");
  }
});
```

เปรียบเทียบกับ admin.ts ที่มี double-check กับ /users/me endpoint

- **Root Cause:** ผู้พัฒนาทำ double-check เฉพาะ admin แต่ลืมทำสำหรับ role อื่น
- **Impact:** ผู้ใช้สามารถแก้ cookie userRole=customer แล้วเข้าถึง customer pages ได้ แม้ token จะ expire หรือถูก revoke แล้ว
- **Recommended Fix:** เพิ่ม backend verification ใน customer.ts และ editor.ts คล้ายกับ admin.ts — เรียก GET /users/me และตรวจสอบ user.userRole
- **Frontend Changes:** แก้ customer.ts และ editor.ts ให้เรียก /users/me เหมือน admin.ts
- **Backend Changes:** ไม่ต้องแก้
- **Migration Required:** No
- **Test Required:** แก้ cookie แล้วเข้าหน้า customer/dashboard ต้องถูก redirect
- **Priority:** P1

---

### ISSUE-FE-002: httpOnly: true ใน useCookie ไม่มีผลฝั่ง Client

- **Severity:** High
- **Category:** Security
- **File/Module:** frontend/app/services/auth.service.ts
- **Line/Function/Route:** บรรทัด 41-46
- **Problem:** ใน Nuxt 3 การ set httpOnly: true ด้วย useCookie บน client-side ไม่มีผล เพราะ httpOnly cookie จะต้องถูก set โดย server response header เท่านั้น ผลลัพธ์คือ JWT token ยังสามารถถูก JavaScript อ่านได้ ทำให้เสี่ยงต่อ XSS
- **Evidence:**

```typescript
const token = useCookie<string | null>("token", {
  sameSite: "lax",
  httpOnly: true,  // ไม่มีผลเมื่อ set จาก client-side
  secure: process.env.NODE_ENV === 'production',
});
token.value = data.token;
```

- **Root Cause:** ความเข้าใจผิดเกี่ยวกับ httpOnly ใน Nuxt 3
- **Impact:** Token สามารถถูกขโมยผ่าน XSS attack ได้
- **Recommended Fix:** สร้าง Nuxt Server Route /api/auth/login ที่ set cookie ด้วย setCookie(event, 'token', value, { httpOnly: true, secure: true })
- **Frontend Changes:** เพิ่ม Nuxt server route สำหรับ auth
- **Priority:** P1

---

### ISSUE-FE-003: ไม่มี Pagination ใน List Pages

- **Severity:** High
- **Category:** Functionality / Performance
- **File/Module:** pages/admin/orders.vue, users.vue, customer/orders/index.vue, editor/jobs/index.vue
- **Problem:** ทุก List page ดึงข้อมูลทั้งหมดมาพร้อมกัน แล้ว filter ใน client
- **Evidence:** orderService.getMyOrders() ไม่มี ?page=&limit= parameter
- **Impact:** เมื่อข้อมูลมีหลักร้อยหรือพัน record จะโหลดช้า และ browser อาจ crash
- **Recommended Fix:**
  - Backend: เพิ่ม ?page=&limit= query param ใน GET /orders, GET /users
  - Frontend: เพิ่ม Pagination component
- **Priority:** P2

---

### ISSUE-FE-004 ถึง ISSUE-FE-012 (Medium/Low)

- **FE-004:** alert() ใน payments.vue บรรทัด 42 — แก้เป็น reactive errorMessage ref
- **FE-005:** create.vue 851 บรรทัด — แยกเป็น Step components
- **FE-006:** AuthResponse.user เป็น any — กำหนด type ชัดเจน
- **FE-007:** Upload error ไม่ reset — เพิ่ม uploadError.value = "" ใน handleFileSelect
- **FE-008:** ขาด aria attributes — เพิ่ม aria-label บน icon buttons, for ใน labels
- **FE-009:** ไม่ใช้ NuxtImg — เปลี่ยน img tags
- **FE-010:** axios, better-sqlite3 unused — ลบออกจาก package.json
- **FE-011:** ขาด Confirmation dialog — เพิ่มก่อนลบ
- **FE-012:** Admin Dashboard ไม่ใช้ /reports — เปลี่ยน apiFetch("/orders") เป็น apiFetch("/reports")

---

## 8. Recommended Fixes (สรุป)

| ลำดับ | Issue | ความยาก | ผลกระทบ |
|-------|-------|---------|---------|
| 1 | FE-001: เพิ่ม backend verify ใน customer/editor middleware | ต่ำ | สูง |
| 2 | FE-003: เพิ่ม Pagination | กลาง | สูง |
| 3 | FE-002: แก้ httpOnly cookie | สูง | กลาง |
| 4 | FE-005: แยก create.vue | กลาง | กลาง |
| 5 | FE-006: แก้ AuthResponse type | ต่ำ | ต่ำ |

---

## 9. Testing Recommendations

ปัจจุบัน Frontend ไม่มี test เลย ควรเพิ่ม:

1. Unit Test (Vitest): useApi.ts, authService.login()
2. Component Test: Login form, Order create wizard step navigation
3. E2E (Playwright): Login flow, Customer order creation, Admin payment approval

---

## 10. Remediation Roadmap

- Phase 1 (Sprint 4): FE-001, FE-002 — Security fixes
- Phase 2 (Sprint 4): FE-003 — Pagination
- Phase 3 (Sprint 5): FE-005, FE-006, FE-012 — Code quality
- Phase 4 (Sprint 5): Frontend testing setup
- Phase 5 (Sprint 5): FE-004, FE-007, FE-008 — UX/Accessibility

---

## 11. Deploy Blockers

| # | Issue | เหตุผล |
|---|-------|-------|
| 1 | FE-001 | Customer/Editor routes สามารถ bypass ได้ด้วย cookie manipulation |
| 2 | FE-003 | List pages จะ timeout เมื่อมีข้อมูลจำนวนมาก |
| 3 | ไม่มี Test | ไม่สามารถพิสูจน์ได้ว่า feature ทำงานถูกต้อง |

---

## 12. Final Verdict

**คะแนน Frontend: 59/100**
**สถานะ: MVP**

- จุดแข็ง: Feature ครอบคลุมมาก, TypeScript ส่วนใหญ่ดี, Admin middleware มี double-check, UX สม่ำเสมอ
- จุดอ่อน: ไม่มี Test, ขาด Pagination, Middleware บางส่วน cookie-only, httpOnly ใช้ไม่ได้จริง
- Deploy Blockers: 3 รายการ

---

## 13. File References

- frontend/app/composables/useApi.ts — Core API wrapper
- frontend/app/services/auth.service.ts — Auth service
- frontend/app/middleware/admin.ts — Admin route guard (ดี)
- frontend/app/middleware/customer.ts — Customer route guard (ต้องแก้)
- frontend/app/middleware/editor.ts — Editor route guard (ต้องแก้)
- frontend/app/pages/customer/orders/create.vue — 4-step order wizard (851 lines)
- frontend/app/pages/admin/payments.vue — Payment management (มี alert())
- frontend/app/types/auth.types.ts — Auth types (user: any — ต้องแก้)

---

## 14. Unable to Verify

- Responsive Design: ไม่ได้เปิด browser จริง
- Animation / Transition: ตรวจจาก code เท่านั้น
- Font Loading / CLS: ไม่ได้วัด Core Web Vitals จริง
- Nuxt SSR Hydration: ไม่ได้รันระบบจริง

---

*รายงานนี้เป็น Static Code Review — ไม่ได้รันระบบจริง*
*วันที่สร้าง: 20 กรกฎาคม 2026*
