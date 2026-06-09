# COOS Database — ER Diagram & Use Case Diagram

เอกสารนี้แสดง Entity Relationship Diagram (ER Diagram) และ Use Case Diagram ของระบบ COOS
สร้างจากไฟล์ [database.sql](../backend/database.sql)

---

## 1. ER Diagram (Entity Relationship Diagram)

```mermaid
erDiagram
    users {
        INT userId PK
        VARCHAR userFirstName
        VARCHAR userLastName
        VARCHAR userEmail UK
        VARCHAR userPassword
        VARCHAR userPhone
        TEXT userAddress
        VARCHAR userProfileImage
        JSON userContactChannels
        ENUM userRole "admin | customer | editor"
        VARCHAR userResetToken
        TIMESTAMP userResetTokenExpiry
        TIMESTAMP userCreatedAt
        TIMESTAMP userUpdatedAt
    }

    workTypes {
        INT workTypeId PK
        VARCHAR workTypeName UK
        TEXT workTypeDescription
        TINYINT workTypeIsActive
        TIMESTAMP workTypeCreatedAt
        TIMESTAMP workTypeUpdatedAt
    }

    packages {
        INT packageId PK
        VARCHAR packageName
        TEXT packageDescription
        INT packageImageCount
        ENUM packageResolution "FullHD | 4K"
        INT packageDeliveryDays
        DECIMAL packagePrice
        DECIMAL packageUrgentPrice
        DECIMAL packageGalleryDiscount
        TINYINT packageIsActive
        TIMESTAMP packageCreatedAt
        TIMESTAMP packageUpdatedAt
    }

    galleryImages {
        INT imageId PK
        VARCHAR imageUrl
        INT workTypeId FK
        VARCHAR imageTitle
        TEXT imageDescription
        VARCHAR imageTags
        TINYINT imageIsActive
        TIMESTAMP imageCreatedAt
        TIMESTAMP imageUpdatedAt
    }

    policies {
        INT policyId PK
        VARCHAR policyTitle
        TEXT policyContent
        ENUM policyType "refund | terms | privacy"
        TINYINT policyIsActive
        TIMESTAMP policyCreatedAt
        TIMESTAMP policyUpdatedAt
    }

    orders {
        INT orderId PK
        INT customerId FK
        INT editorId FK
        INT packageId FK
        INT workTypeId FK
        VARCHAR orderStyle
        VARCHAR orderColorTone
        TEXT orderComposition
        TEXT orderNote
        DATE orderRequiredDate
        TINYINT orderIsUrgent
        TINYINT orderIsGalleryAllowed
        DECIMAL orderBasePrice
        DECIMAL orderUrgentPrice
        DECIMAL orderDiscount
        DECIMAL orderTotalPrice
        ENUM orderStatus "waiting_deposit | waiting_assignment | waiting_to_start | in_progress | waiting_selection | waiting_final_payment | delivered | completed | cancelled"
        TIMESTAMP orderCreatedAt
        TIMESTAMP orderUpdatedAt
    }

    orderImages {
        INT orderImageId PK
        INT orderId FK
        ENUM imageType "source | ai_generated | selected_final"
        VARCHAR imageUrl
        VARCHAR imageThumbnailUrl
        VARCHAR aiEngine
        TEXT positivePrompt
        TEXT negativePrompt
        FLOAT cfgScale
        INT steps
        VARCHAR seed
        TIMESTAMP imageCreatedAt
    }

    payments {
        INT paymentId PK
        INT orderId FK
        ENUM paymentType "deposit | final"
        DECIMAL paymentAmount
        VARCHAR paymentSlipUrl
        ENUM paymentStatus "pending | approved | rejected"
        TIMESTAMP paymentCreatedAt
        TIMESTAMP paymentVerifiedAt
        INT verifiedByAdminId FK
    }

    workflowLogs {
        INT logId PK
        INT orderId FK
        VARCHAR fromStatus
        VARCHAR toStatus
        INT changedById FK
        TIMESTAMP changedAt
        TEXT logNote
    }

    users ||--o{ orders : "สั่งงาน (customer)"
    users ||--o{ orders : "รับงาน (editor)"
    users ||--o{ payments : "ตรวจสอบ (admin)"
    users ||--o{ workflowLogs : "เปลี่ยนสถานะ"
    packages ||--o{ orders : "ใช้แพ็กเกจ"
    workTypes ||--o{ orders : "ประเภทงาน"
    workTypes ||--o{ galleryImages : "หมวดหมู่"
    orders ||--o{ orderImages : "รูปภาพในออเดอร์"
    orders ||--o{ payments : "การชำระเงิน"
    orders ||--o{ workflowLogs : "ประวัติสถานะ"
```

---

## 2. ER Diagram — เฉพาะความสัมพันธ์ (Simplified)

```mermaid
graph LR
    subgraph Core["🔑 Core Tables"]
        U["👤 users"]
        O["📋 orders"]
    end

    subgraph Reference["📚 Reference Tables"]
        WT["🎨 workTypes"]
        PK["📦 packages"]
    end

    subgraph Order_Details["📎 Order Details"]
        OI["🖼️ orderImages"]
        PM["💳 payments"]
        WL["📝 workflowLogs"]
    end

    subgraph Content["🌐 Content Tables"]
        GI["🖼️ galleryImages"]
        PL["📄 policies"]
    end

    U -->|"customerId"| O
    U -.->|"editorId"| O
    PK -->|"packageId"| O
    WT -->|"workTypeId"| O
    O -->|"orderId"| OI
    O -->|"orderId"| PM
    O -->|"orderId"| WL
    U -.->|"verifiedByAdminId"| PM
    U -.->|"changedById"| WL
    WT -->|"workTypeId"| GI
```

---

## 3. Use Case Diagrams

### 3.1 Use Case — Customer (ลูกค้า)

```mermaid
graph LR
    C["🧑‍💻 Customer<br/>ลูกค้า"]

    subgraph Auth["🔐 Authentication"]
        UC1["สมัครสมาชิก<br/>Register"]
        UC2["เข้าสู่ระบบ<br/>Login"]
        UC3["ลืมรหัสผ่าน<br/>Forgot Password"]
        UC4["รีเซ็ตรหัสผ่าน<br/>Reset Password"]
    end

    subgraph Profile["👤 Profile Management"]
        UC5["ดูข้อมูลโปรไฟล์<br/>View Profile"]
        UC6["แก้ไขโปรไฟล์<br/>Edit Profile"]
        UC7["อัปโหลดรูปโปรไฟล์<br/>Upload Avatar"]
    end

    subgraph OrderMgmt["📋 Order Management"]
        UC8["สร้างออเดอร์ใหม่<br/>Create Order"]
        UC9["เลือกแพ็กเกจ<br/>Select Package"]
        UC10["เลือกประเภทงาน<br/>Select Work Type"]
        UC11["อัปโหลดรูปต้นฉบับ<br/>Upload Source Images"]
        UC12["ดูสถานะออเดอร์<br/>View Order Status"]
        UC13["คัดเลือกผลงาน<br/>Select Final Images"]
    end

    subgraph Payment["💳 Payment"]
        UC14["ชำระค่ามัดจำ 30%<br/>Pay Deposit"]
        UC15["ชำระเงินส่วนที่เหลือ 70%<br/>Pay Final"]
        UC16["อัปโหลดสลิปโอนเงิน<br/>Upload Payment Slip"]
    end

    subgraph PublicView["🌐 Public"]
        UC30["ดูรูปภาพ Gallery<br/>Browse Gallery"]
        UC31["ดูนโยบาย<br/>View Policies"]
        UC32["กรองรูปตามประเภท แท็ก<br/>Filter Gallery"]
    end

    C --- UC1 & UC2 & UC3 & UC4
    C --- UC5 & UC6 & UC7
    C --- UC8 & UC9 & UC10 & UC11 & UC12 & UC13
    C --- UC14 & UC15 & UC16
    C --- UC30 & UC31 & UC32
```

---

### 3.2 Use Case — Editor (ช่างภาพ/นักแต่งภาพ)

```mermaid
graph LR
    E["🎨 Editor<br/>ช่างภาพ/นักแต่งภาพ"]

    subgraph Auth["🔐 Authentication"]
        UC2["เข้าสู่ระบบ<br/>Login"]
    end

    subgraph Profile["👤 Profile Management"]
        UC5["ดูข้อมูลโปรไฟล์<br/>View Profile"]
        UC6["แก้ไขโปรไฟล์<br/>Edit Profile"]
        UC7["อัปโหลดรูปโปรไฟล์<br/>Upload Avatar"]
    end

    subgraph EditorWork["🎨 Editor Tasks"]
        UC17["ดูงานที่ได้รับมอบหมาย<br/>View Assigned Orders"]
        UC18["ดำเนินการแต่งภาพ<br/>Process Images"]
        UC19["อัปโหลดภาพ AI<br/>Upload AI Images"]
        UC20["บันทึก AI Prompt<br/>Save AI Prompt Data"]
        UC21["อัปเดตสถานะงาน<br/>Update Order Status"]
    end

    E --- UC2
    E --- UC5 & UC6 & UC7
    E --- UC17 & UC18 & UC19 & UC20 & UC21
```

---

### 3.3 Use Case — Admin (ผู้ดูแลระบบ)

```mermaid
graph LR
    A["👨‍💼 Admin<br/>ผู้ดูแลระบบ"]

    subgraph Auth["🔐 Authentication"]
        UC2["เข้าสู่ระบบ<br/>Login"]
    end

    subgraph Profile["👤 Profile Management"]
        UC5["ดูข้อมูลโปรไฟล์<br/>View Profile"]
    end

    subgraph UserMgmt["👥 User Management"]
        UC22["จัดการผู้ใช้<br/>Manage Users"]
        UC23["มอบหมายงานให้ Editor<br/>Assign Editor"]
    end

    subgraph PaymentMgmt["💳 Payment Management"]
        UC24["ตรวจสอบสลิป อนุมัติการชำระเงิน<br/>Verify Payment"]
    end

    subgraph ContentMgmt["📦 Content Management"]
        UC25["จัดการแพ็กเกจ<br/>Manage Packages"]
        UC26["จัดการประเภทงาน<br/>Manage Work Types"]
        UC27["จัดการรูปภาพ Gallery<br/>Manage Gallery"]
        UC28["จัดการนโยบาย<br/>Manage Policies"]
    end

    subgraph Monitoring["📊 Monitoring"]
        UC29["ดู Workflow Logs<br/>View Logs"]
    end

    A --- UC2
    A --- UC5
    A --- UC22 & UC23
    A --- UC24
    A --- UC25 & UC26 & UC27 & UC28
    A --- UC29
```

---

## 4. Order Status Flow (Workflow)

```mermaid
stateDiagram-v2
    [*] --> waiting_deposit : ลูกค้าสร้างออเดอร์

    waiting_deposit --> waiting_assignment : ชำระมัดจำ 30% สำเร็จ
    waiting_deposit --> cancelled : ลูกค้ายกเลิก

    waiting_assignment --> waiting_to_start : Admin มอบหมาย Editor

    waiting_to_start --> in_progress : Editor เริ่มดำเนินการ

    in_progress --> waiting_selection : Editor ส่งผลงาน

    waiting_selection --> in_progress : ลูกค้าขอแก้ไข
    waiting_selection --> waiting_final_payment : ลูกค้าเลือกผลงาน

    waiting_final_payment --> delivered : ชำระส่วนที่เหลือ 70% สำเร็จ

    delivered --> completed : ส่งมอบผลงานเรียบร้อย

    note right of waiting_deposit : มัดจำ 30%
    note right of waiting_final_payment : ส่วนที่เหลือ 70%
    note right of completed : เสร็จสมบูรณ์
```

---

## 5. สรุปตาราง (Table Summary)

| # | ตาราง | จำนวนฟิลด์ | คำอธิบาย | ความสัมพันธ์ |
|---|-------|------------|----------|-------------|
| 1 | `users` | 13 | ผู้ใช้งานทั้ง 3 บทบาท (admin, customer, editor) | อ้างอิงโดย orders, payments, workflowLogs |
| 2 | `workTypes` | 6 | ประเภทงาน (Pre-wedding, Portrait, etc.) | อ้างอิงโดย orders, galleryImages |
| 3 | `packages` | 11 | แพ็กเกจบริการ (Basic, Standard, Pro) | อ้างอิงโดย orders |
| 4 | `galleryImages` | 9 | รูปภาพตัวอย่างผลงานใน Portfolio | FK → workTypes |
| 5 | `policies` | 7 | นโยบาย (refund, terms, privacy) | ไม่มี FK |
| 6 | `orders` | 18 | ออเดอร์งาน — ตารางหลัก | FK → users, packages, workTypes |
| 7 | `orderImages` | 11 | รูปภาพในออเดอร์ + ข้อมูล AI Prompt | FK → orders |
| 8 | `payments` | 8 | การชำระเงิน (มัดจำ + ส่วนที่เหลือ) | FK → orders, users |
| 9 | `workflowLogs` | 6 | ประวัติการเปลี่ยนสถานะออเดอร์ | FK → orders, users |

> **รวมทั้งหมด**: 9 ตาราง, 89 ฟิลด์, 10 Foreign Key relationships
