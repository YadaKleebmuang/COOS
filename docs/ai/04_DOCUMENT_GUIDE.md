# 04 — Document Guide (คู่มือเอกสาร S01–S28)

> ไฟล์นี้อธิบายว่าเอกสารแต่ละหัวข้อ (S01–S28) คืออะไร และควรมีเนื้อหาอะไร  
> ใช้เป็น Reference สำหรับ AI ในการสร้างเอกสารแต่ละหัวข้อ

---

## รายการเอกสาร S01–S28

### S01 — วิเคราะห์ปัญหาและความต้องการ ✅ เสร็จแล้ว

**คืออะไร:** วิเคราะห์ปัญหาของระบบเดิม ความต้องการของผู้ใช้ และกำหนด Requirements ทั้งหมด

**ควรมี:**
- ปัญหาที่พบ / สาเหตุ / ผลกระทบ
- วัตถุประสงค์ของระบบ
- ขอบเขตระบบ (In/Out of Scope)
- Functional Requirements (FR)
- Non-Functional Requirements (NFR)

**ไฟล์ที่เกี่ยวข้อง:** `database.sql`, `orderController.js`, `README.md`

---

### S02 — กลุ่มเป้าหมาย (Persona) และ Use Case ✅ เสร็จแล้ว

**คืออะไร:** กำหนดกลุ่มผู้ใช้เป้าหมาย วิเคราะห์ User Persona และ Use Cases ทั้งหมด

**ควรมี:**
- Stakeholder Analysis
- User Persona (Customer, Editor, Admin)
- User Journey Map
- Pain Points และ Goals
- Use Case Diagram (Mermaid)
- Use Case Description (Pre/Post-condition, Main Flow)

**ไฟล์ที่เกี่ยวข้อง:** `ER_DIAGRAM_USECASE.md`, `pages/`, Role Middleware

---

### S03 — แผนงาน ระยะเวลา และความเสี่ยง ✅ เสร็จแล้ว

**คืออะไร:** วางแผนการพัฒนา กำหนด Timeline และวิเคราะห์ความเสี่ยง

**ควรมี:**
- Project Plan (Milestone, Team)
- Work Breakdown Structure (WBS)
- Sprint Planning (Scrum)
- Gantt Chart (Mermaid)
- Risk Assessment (โอกาส × ผลกระทบ)
- Risk Mitigation (แผนรับมือ)

**ไฟล์ที่เกี่ยวข้อง:** `GIT_WORKFLOW.md`, `README.md`, Project State

---

### S04 — Repository และ Version Control ✅ เสร็จแล้ว

> **หมายเหตุ (อัปเดต 15 ก.ค. 68):** ตรวจพบว่า `backend/.env` ยังไม่อยู่ใน `.gitignore` — ข้อมูลนี้ต้องบันทึกใน S04 เมื่อสร้าง

**คืออะไร:** อธิบายการใช้งาน Git, GitHub, Branch Strategy และ Folder Structure

**ควรมี:**
- Git Repository Information
- Folder Structure ทั้งระบบ
- Branch Strategy (main, feature/*, chore/*)
- Commit Convention (Conventional Commits)
- `.gitignore` และเหตุผล
- Version Control Workflow

**ไฟล์ที่เกี่ยวข้อง:** `GIT_WORKFLOW.md`, `.gitignore`, `README.md`

---

### S05 — Wireframe / Prototype ✅ เสร็จแล้ว

**คืออะไร:** แสดง Wireframe หน้าจอทั้งหมดและ Navigation Flow

**ควรมี:**
- Screen Inventory (รายการหน้าจอทั้งหมด)
- Wireframe ภาพ (As-Built จากหน้าจอจริง)
- Screen Description (Input/Output/Action)
- Navigation Flow Diagram
- URL Route Map
- Layout Component Map

**ไฟล์ที่เกี่ยวข้อง:** `pages/`, `layouts/`, `components/layout/`

---

### S06 — สถาปัตยกรรมระบบ ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย Architecture ของระบบในภาพรวม

**ควรมี:**
- System Architecture Diagram (Mermaid)
- Component Diagram
- Deployment Diagram (Docker)
- Data Flow Diagram (DFD)
- Technology Stack และเหตุผลที่เลือก
- การสื่อสารระหว่าง Frontend ↔ Backend ↔ Database

**ไฟล์ที่เกี่ยวข้อง:** `docker-compose.yml`, `app.js`, `FRONTEND_ARCHITECTURE.md`

---

### S07 — ฐานข้อมูล ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบายโครงสร้างฐานข้อมูลอย่างละเอียด

**ควรมี:**
- ER Diagram (Mermaid)
- คำอธิบายแต่ละตาราง (Column, Data Type, Constraint)
- Relationship (1:1, 1:N, N:N)
- Indexes และ Foreign Keys
- Database Configuration
- Seed Data (ตัวอย่างข้อมูล)

**ไฟล์ที่เกี่ยวข้อง:** `database.sql`, `config/db.js`

---

### S08 — UML / API / Interface Design ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย API Endpoints, UML Diagrams และ Interface

**ควรมี:**
- API Documentation (Method, Path, Request, Response)
- Sequence Diagram (สำหรับ Flow หลัก)
- Class Diagram (Models)
- State Diagram (Order Status Machine)
- Request/Response Schema

**ไฟล์ที่เกี่ยวข้อง:** `routes/v1/` (14 files), `controllers/` (13 files), `models/` (9 files), `types/` (auth, user, order)

---

### S09 — UI Design System ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย Design System, Color Palette, Typography และ Component

**ควรมี:**
- Color Palette (Tailwind Config)
- Typography (Font, Size)
- Component Library (Button, Input, Card, Badge)
- Layout Grid System
- Dark/Light Mode
- Icon System (Iconify)

**ไฟล์ที่เกี่ยวข้อง:** `tailwind.config.ts`, `main.css`, `components/`

---

### S10 — Login / Role / Permission ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบายระบบ Authentication, Authorization และการจัดการสิทธิ์

**ควรมี:**
- Authentication Flow Diagram
- JWT Token Structure
- Role-Based Access Control (RBAC)
- Middleware Chain
- Route Protection (Frontend + Backend)
- Security Considerations

**ไฟล์ที่เกี่ยวข้อง:** `auth.controller.js`, `auth.middleware.js`, `middleware/*.ts`

---

### S11 — ฟังก์ชันหลักที่ 1 ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบายฟีเจอร์หลักแรกของระบบ (แนะนำ: ระบบสร้างและจัดการออเดอร์)

**ควรมี:**
- ภาพรวมฟีเจอร์
- Sequence Diagram
- หน้าจอที่เกี่ยวข้อง (Screenshot/Wireframe)
- การทำงานของ Backend (Controller + Model)
- Validation Rules
- Edge Cases

**ไฟล์ที่เกี่ยวข้อง:** `orderController.js`, `orderModel.js`, `orders/create.vue`

---

### S12 — ฟังก์ชันหลักที่ 2 ⬜ ยังไม่เริ่ม

**คืออะไร:** ฟีเจอร์หลักที่สอง (แนะนำ: ระบบชำระเงินและการยืนยัน)

**ควรมี:** เหมือน S11 แต่สำหรับ Payment Flow

**ไฟล์ที่เกี่ยวข้อง:** Payment-related code ใน `orderController.js`, `orders/[id].vue`

---

### S13 — ฟังก์ชันหลักที่ 3 ⬜ ยังไม่เริ่ม

**คืออะไร:** ฟีเจอร์หลักที่สาม (แนะนำ: Editor Workspace และ AI Image Upload)

**ควรมี:** เหมือน S11 แต่สำหรับ Editor Flow

**ไฟล์ที่เกี่ยวข้อง:** `jobs/[id].vue`, `components/editor/job/*`

---

### S14 — CRUD / Search / Report ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย CRUD Operations, Search/Filter และ Reporting

**ควรมี:**
- CRUD Flow ของแต่ละ Entity (Package, WorkType, User, Gallery, Policy)
- Search/Filter Logic
- Table Displays
- Pagination (ถ้ามี)
- Admin Reports/Dashboard

**ไฟล์ที่เกี่ยวข้อง:** `admin/*.vue` (13 pages), `report.controller.js`, `setting.controller.js`, `tag.controller.js`, `file.controller.js`

---

### S15 — API / AI / ระบบภายนอก ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย API Integration และการเชื่อมต่อ External Systems

**ควรมี:**
- External APIs (ถ้ามี)
- AI Tools Integration (Midjourney, Stable Diffusion, Flux — ใช้ภายนอก)
- Upload System (Multer + File Storage)
- CORS Configuration

**ไฟล์ที่เกี่ยวข้อง:** `config/upload.js`, `upload.controller.js`

---

### S16 — Responsive ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบายการรองรับหน้าจอหลายขนาด

**ควรมี:**
- Breakpoints (Tailwind: sm, md, lg, xl)
- Mobile Layout
- Tablet Layout
- Desktop Layout
- Testing Matrix

**หมายเหตุ:** ปัจจุบันรองรับ Desktop เท่านั้น → ต้องพัฒนาเพิ่ม

---

### S17 — Error Handling ⬜ ยังไม่เริ่ม

**คืออะไร:** อธิบาย Error Handling Strategy

**ควรมี:**
- Error Types (HTTP Status Codes)
- Backend Error Response Format
- Frontend Error Display
- Form Validation
- Network Error Handling
- Known Error Cases

---

### S18 — Test Case ⬜ ยังไม่เริ่ม

**คืออะไร:** Test Plan และ Test Cases ครอบคลุมทุกฟีเจอร์

**ควรมี:**
- Test Plan
- Test Cases (TC-001 ถึง TC-XXX)
- Test Scenario (ปกติ / Error / Edge)
- Pass/Fail Criteria

---

### S19 — Unit Test ⬜ ยังไม่เริ่ม

**คืออะไร:** ผลการทดสอบ Unit Test

**ควรมี:**
- Framework ที่ใช้ (Jest, Vitest ฯลฯ)
- Test Files
- Coverage Report
- Pass/Fail Summary

---

### S20 — Integration Test ⬜ ยังไม่เริ่ม

**คืออะไร:** ผลการทดสอบ Integration (API + DB + Frontend)

**ควรมี:**
- Test Scenarios
- API Test Results
- End-to-End Flow Testing
- Pass/Fail Summary

---

### S21 — User Acceptance Test (UAT) ⬜ ยังไม่เริ่ม

**คืออะไร:** ผลการทดสอบกับผู้ใช้จริง

**ควรมี:**
- UAT Plan
- Tester Information
- UAT Scenarios
- Results
- Feedback และการแก้ไข

---

### S22 — Security / Performance ⬜ ยังไม่เริ่ม

**คืออะไร:** วิเคราะห์ความปลอดภัยและประสิทธิภาพ

**ควรมี:**
- Security Issues และการแก้ไข
- RBAC Testing
- Input Validation
- SQL Injection Prevention
- Performance Metrics (Load Time, API Response)

---

### S23 — Bug Fix / Refactor ⬜ ยังไม่เริ่ม

**คืออะไร:** ประวัติการแก้ไข Bug และ Refactoring

**ควรมี:**
- Bug Log (ID, Description, Severity, Status)
- Refactoring ที่ทำ
- Before/After Code Comparison
- Performance Improvement

---

### S24 — Deployment ⬜ ยังไม่เริ่ม

**คืออะไร:** คู่มือและผลการ Deploy ระบบบน Production Server

**ควรมี:**
- Deployment Architecture
- Step-by-step Deployment Guide
- Environment Variables
- Docker Production Config
- SSL/Domain Setup
- Health Check

**ไฟล์ที่เกี่ยวข้อง:** `docker-compose.yml`, Dockerfiles

---

### S25 — Backup / Maintenance ⬜ ยังไม่เริ่ม

**คืออะไร:** แผนการสำรองข้อมูลและบำรุงรักษาระบบ

**ควรมี:**
- Backup Strategy (Database + Files)
- Maintenance Schedule
- Monitoring
- Log Management
- Recovery Plan

---

### S26 — คู่มือผู้ใช้ ⬜ ยังไม่เริ่ม

**คืออะไร:** คู่มือการใช้งานสำหรับผู้ใช้ทุก Role

**ควรมี:**
- คู่มือ Customer (สมัคร, สั่งงาน, ชำระ, ติดตาม)
- คู่มือ Editor (รับงาน, อัปโหลด, ส่งงาน)
- คู่มือ Admin (จัดการ, อนุมัติ, มอบหมาย)
- FAQ

---

### S27 — สถิติและการนำเสนอ ⬜ ยังไม่เริ่ม

**คืออะไร:** สรุปผลการพัฒนา สถิติการใช้งาน และการนำเสนอโครงงาน

**ควรมี:**
- สรุปผลการพัฒนา
- ปัญหาที่พบและวิธีแก้ไข
- สิ่งที่ได้เรียนรู้
- ข้อเสนอแนะสำหรับการพัฒนาในอนาคต
- Slide สำหรับนำเสนอ

---

### S28 — ส่งมอบ Source Code ⬜ ยังไม่เริ่ม

**คืออะไร:** เอกสารสรุปการส่งมอบ Source Code และโครงงาน

**ควรมี:**
- Source Code Structure
- Installation Guide
- README ฉบับสมบูรณ์
- Database Setup Script
- Environment Variables Template
- Demo Account Information
- Link GitHub Repository

---

## สรุปจำนวนเอกสาร

| หมวดหมู่ | รหัส | จำนวน |
|---------|------|-------|
| Analysis | S01–S05 | 5 หัวข้อ |
| Design | S06–S10 | 5 หัวข้อ |
| Implementation | S11–S15 | 5 หัวข้อ |
| Quality | S16–S23 | 8 หัวข้อ |
| Deployment | S24–S25 | 2 หัวข้อ |
| Delivery | S26–S28 | 3 หัวข้อ |
| **รวม** | S01–S28 | **28 หัวข้อ** |

---

*อัปเดตล่าสุด: 15 กรกฎาคม 2568*
