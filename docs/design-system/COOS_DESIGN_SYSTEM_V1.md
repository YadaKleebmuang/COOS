# COOS Design System v1

> **System:** COOS  
> **Design Direction:** COOS Soft Studio  
> **Version:** 1.0  
> **Scope:** Public / Customer / Editor / Admin

---

## 1. Design Vision

COOS ใช้แนวทาง:

> **Modern Creative Studio × Premium Digital Workspace**

เป้าหมายคือทำให้ระบบดูสร้างสรรค์ ทันสมัย สะอาด และเป็นมืออาชีพ โดยยังรองรับข้อมูลจำนวนมากในฝั่ง Editor และ Admin ได้โดยไม่เสีย Usability

แกนหลักของ Design System:

- Soft Minimal
- Editorial
- Subtle Glass
- Premium SaaS
- Creative Workspace
- Content First

ชื่อ Visual Direction อย่างเป็นทางการ:

## COOS Soft Studio

---

## 2. Design Principles

### 2.1 Content First

ข้อมูล Order, รูปภาพ, สถานะงาน และ Action สำคัญต้องเด่นกว่า Decoration

UI ไม่ควรแย่งความสนใจจากงานของผู้ใช้

### 2.2 Calm Interface

ลด Visual Noise ด้วย:

- Border บาง
- Shadow เบา
- ใช้สีให้น้อย
- White Space มากพอ
- ลด Component ที่ไม่จำเป็น

### 2.3 Images Matter

COOS เป็นระบบเกี่ยวกับ Creative Work ดังนั้นรูปภาพควรเป็น First-class Content

ทุกพื้นที่ที่เกี่ยวข้องกับผลงานควรให้ Thumbnail / Preview มีความสำคัญ

### 2.4 Clear Status

ผู้ใช้ต้องสามารถตอบได้ทันทีว่า:

> “งานนี้อยู่ขั้นตอนไหน?”

ทุก Order ต้องมี Status ที่ชัดเจนและใช้รูปแบบเดียวกันทั้งระบบ

### 2.5 One Product, Different Roles

Public, Customer, Editor และ Admin มีความต้องการต่างกัน แต่ต้องดูเหมือน Product เดียวกัน

สิ่งที่ต้องเหมือนกัน:

- Typography
- Color language
- Radius
- Spacing
- Badge
- Button
- Form
- Modal
- Feedback state

สิ่งที่ปรับตาม Role ได้:

- Layout
- Information density
- Navigation
- Decorative level

---

## 3. Role Visual Direction

| Area | Direction | Density |
|---|---|---|
| Public | Editorial Creative | Low |
| Customer | Calm Premium Workspace | Low–Medium |
| Editor | Creative Production Workspace | Medium |
| Admin | Operational Control Center | Medium–High |

### Creative Level

- Public: ██████████
- Customer: ████████░░
- Editor: ██████░░░░
- Admin: ███░░░░░░░

---

## 4. Color System

### 4.1 Neutral Colors

```css
--coos-bg: #F7F7F5;
--coos-surface: #FFFFFF;
--coos-surface-soft: #F3F3F1;
--coos-surface-hover: #EEEEEC;
```

### 4.2 Text

```css
--coos-text-primary: #171717;
--coos-text-secondary: #666666;
--coos-text-muted: #929292;
--coos-text-disabled: #B8B8B8;
```

---

## 5. Primary Brand Color

COOS ใช้ **Near Black** เป็น Primary UI Color

```css
--coos-primary: #171717;
--coos-primary-hover: #292929;
--coos-primary-active: #0A0A0A;
--coos-on-primary: #FFFFFF;
```

ใช้กับ:

- Primary CTA
- Important action
- Active navigation บางรูปแบบ
- Button หลัก
- Confirmation action

---

## 6. Accent Color

### COOS Violet

```css
--coos-accent: #756CE8;
--coos-accent-soft: #F0EEFF;
--coos-accent-hover: #675DDC;
```

ใช้กับ:

- Selected state
- Focus
- Links สำคัญ
- Progress
- Active indicator
- Creative highlight

### Rule

Accent ต้องไม่ครอง UI

แนวทางสัดส่วน:

- Neutral: 80–90%
- Accent: 5–10%
- Semantic Color: 5–10%

---

## 7. Semantic Colors

### Success

```css
--coos-success-text: #267A48;
--coos-success-bg: #EDF8F1;
```

ใช้กับ:

- งานเสร็จแล้ว
- Approved
- Successful payment
- Completed

### Info / In Progress

```css
--coos-info-text: #3566B8;
--coos-info-bg: #EDF3FF;
```

### Warning / Waiting

```css
--coos-warning-text: #9A6812;
--coos-warning-bg: #FFF7E6;
```

### Revision

```css
--coos-revision-text: #A34F22;
--coos-revision-bg: #FFF1E9;
```

### Error / Cancelled

```css
--coos-error-text: #B93B3B;
--coos-error-bg: #FDEEEE;
```

---

## 8. Typography

### Font Family

ใช้ **Noto Sans Thai** เป็น Font หลักทั้งระบบ

```css
font-family: "Noto Sans Thai", Inter, system-ui, sans-serif;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| Display | 40px | 1.2 | 600 | Public Hero |
| Page Title | 30px | 1.3 | 600 | Main Page Heading |
| Section Heading | 20px | 1.4 | 600 | Section |
| Card Heading | 16px | 1.45 | 600 | Card |
| Body Large | 16px | 1.6 | 400 | Important body text |
| Body | 14px | 1.6 | 400 | Default |
| Small | 13px | 1.5 | 400 | Secondary |
| Caption | 12px | 1.5 | 400 | Metadata |

Mobile Page Title แนะนำประมาณ `26px`

### Font Weight

ใช้หลัก ๆ:

- 400
- 500
- 600

หลีกเลี่ยงการใช้ `700–900` จำนวนมาก

---

## 9. Spacing System

Base Unit:

```text
4px
```

Spacing Tokens:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80
```

### Layout Spacing

- Desktop Page Padding: `32–48px`
- Tablet: `24px`
- Mobile: `16px`
- Section Gap Desktop: `32–48px`
- Section Gap Mobile: `24–32px`
- Card Padding Normal: `20–24px`
- Card Padding Compact: `16px`
- Card Padding Large: `28–32px`

---

## 10. Border Radius

```css
--coos-radius-xs: 8px;
--coos-radius-sm: 12px;
--coos-radius-md: 16px;
--coos-radius-lg: 20px;
--coos-radius-xl: 24px;
--coos-radius-pill: 999px;
```

Usage:

- XS: small controls
- SM: inputs / buttons
- MD: images / compact cards
- LG: default cards
- XL: modal / feature cards
- Pill: badges / tags / nav pills

---

## 11. Border

```css
--coos-border: rgba(0, 0, 0, 0.06);
--coos-border-strong: rgba(0, 0, 0, 0.10);
--coos-divider: rgba(0, 0, 0, 0.06);
```

หลีกเลี่ยงเส้น Border สีเข้มโดยไม่จำเป็น

---

## 12. Shadow System

```css
--coos-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
--coos-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.04);
--coos-shadow-md: 0 8px 30px rgba(0, 0, 0, 0.05);
--coos-shadow-floating: 0 16px 48px rgba(0, 0, 0, 0.08);
```

`floating` ใช้เฉพาะ:

- Modal
- Dropdown
- Floating Navbar

ไม่ควรมี Heavy Shadow ใน Table หรือ Card ทุกใบ

---

## 13. Glass System

Glass เป็น Effect เสริม ไม่ใช่ Theme หลัก

เหมาะกับ:

- Navbar
- Floating toolbar
- Modal overlay
- Sticky controls

Recommended:

```css
background: rgba(255, 255, 255, 0.78);
backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.65);
```

ห้ามใช้ Glass กับ:

- Table ทุก Row
- Order Detail ทุก Section
- Form ทุก Block
- Admin Data Card จำนวนมาก

---

## 14. Button System

### Primary Button

```text
Background: #171717
Text: #FFFFFF
Radius: 12px
Height: 44px
Horizontal Padding: 18px
```

### Secondary Button

```text
Background: #FFFFFF
Border: rgba(0,0,0,0.08)
Text: #171717
```

### Ghost Button

ไม่มี Background ใช้สำหรับ Secondary Action

### Destructive Button

ใช้เฉพาะ Action ที่มีความเสี่ยงจริง เช่น:

- Delete
- Cancel Order
- Remove User

### Button Size

- Small: `36px`
- Default: `44px`
- Large: `48px`

---

## 15. Form Controls

Inputs:

```text
Height: 44–48px
Background: White
Border: rgba(0,0,0,0.08)
Radius: 12px
```

Focus:

- Border ใช้ COOS Accent
- มี Soft Focus Ring ที่มองเห็นได้ชัด

### Form Structure

```text
Label
Input
Helper / Error
```

- Field Gap: `20px`
- Label → Input: `8px`

---

## 16. Card System

### Standard Card

```text
Background: White
Radius: 20px
Padding: 24px
Border: Soft
Shadow: XS / SM
```

### Interactive Card

Hover:

- Border เข้มขึ้นเล็กน้อย
- Shadow เพิ่มเล็กน้อย
- Translate Y สูงสุด `-1px`

ไม่ควรมี Hover ที่ทำให้ Layout กระโดด

---

## 17. Order Card

Order Card ควรประกอบด้วย:

1. Thumbnail
2. Order ID
3. ประเภทงาน
4. Current Status
5. Date / Deadline
6. Action ที่จำเป็น

ไม่ควรใส่ข้อมูลทุกอย่างลง Card

ข้อมูลละเอียดให้เปิดใน Order Detail

---

## 18. Thumbnail & Image Fallback

Recommended Ratio:

- `4:3`
- `1:1`

Radius:

```text
14–16px
```

ใช้:

```css
object-fit: cover;
```

### Image Fallback

เมื่อไม่มีรูป:

- ใช้ Soft Gray Surface
- Minimal Icon
- Label เช่น “ไม่มีภาพตัวอย่าง”
- แสดง Order ID แบบ Muted ได้
- ห้ามแสดง Browser Broken Image
- หลีกเลี่ยง Shape หรือ Clipping ที่ดูเหมือน Error

---

## 19. Status Badge

ใช้ Pill Badge

```text
Padding: 5px 10px
Font: 12–13px / 500
```

ตัวอย่าง:

- รอชำระเงิน
- กำลังดำเนินการ
- รอตรวจสอบ
- ขอแก้ไข
- เสร็จสิ้น
- ยกเลิก

### Status Consistency

สถานะเดียวกันต้องใช้:

- สีเดียวกัน
- Text เดียวกัน
- Meaning เดียวกัน

ทุก Role

---

## 20. Table

ใช้ Table กับ Editor / Admin เป็นหลัก

```text
Row Height: 52–60px
Separator: rgba(0,0,0,0.05)
Header: Muted + Medium Weight
Hover: Soft Surface
```

Rules:

- ข้อมูลสำคัญอยู่ซ้าย
- Action อยู่ขวา
- ถ้ามี Action มากกว่า 2–3 รายการ ใช้ `•••` Overflow Menu
- หลีกเลี่ยง Header Background ที่เข้มโดยไม่จำเป็น

---

## 21. Search & Filter

### Search

ควรมี:

- Search icon
- Placeholder ชัดเจน
- Clear button เมื่อมีข้อความ

### Filter

ใช้:

- Dropdown
- Segmented filter
- Filter chip

หลีกเลี่ยง Filter Panel ขนาดใหญ่หากมีเพียง 2–3 Criteria

---

## 22. Navigation

### Public

Top Navigation แบบเบา

ตัวอย่าง:

- Logo
- Gallery
- บริการ
- เกี่ยวกับเรา
- เข้าสู่ระบบ
- Primary CTA: `เริ่มสั่งงาน`

### Customer

ใช้ **Floating Rounded Navbar**

ตัวอย่าง:

- หน้าหลัก
- คำสั่งซื้อ
- แกลเลอรี
- โปรไฟล์

### Editor

ใช้ Sidebar เป็นหลัก

ตัวอย่าง:

- Dashboard
- งานที่ได้รับ
- งานทั้งหมด
- ประวัติ
- การแจ้งเตือน
- โปรไฟล์

Recommended Width:

```text
240–260px
```

### Admin

Sidebar:

```text
240–260px
```

ตัวอย่างโครงสร้าง:

```text
Overview
- Dashboard

Operations
- Orders
- Editors
- Customers

Content
- Gallery
- Categories

Management
- Reports
- Finance
- Settings
```

---

## 23. Modal & Dropdown

### Modal

```text
Radius: 24px
Default Width: 480–640px
```

ต้องมี:

- Clear Title
- Description ถ้าจำเป็น
- Action hierarchy
- Escape / Close
- Destructive Action ที่ชัดเจน

### Dropdown

```text
Radius: 12–14px
Shadow: Floating
Minimum Item Click Area: 40px
```

---

## 24. Empty, Loading & Error States

### Empty State

โครงสร้าง:

```text
Minimal illustration / icon

Heading
Description

CTA (ถ้ามี)
```

ตัวอย่าง:

> ยังไม่มีคำสั่งซื้อ  
> เมื่อคุณเริ่มสั่งงาน รายการล่าสุดจะแสดงที่นี่

CTA:

`สร้างคำสั่งซื้อ`

### Loading

ใช้ Skeleton สำหรับ:

- Card
- Table
- Image
- Order Detail

ไม่ควรใช้ Spinner เต็มหน้า ยกเว้น Initial Application Loading

### Error

Error ต้องบอก:

1. เกิดอะไรขึ้น
2. ผู้ใช้ทำอะไรต่อได้
3. Retry ได้หรือไม่

หลีกเลี่ยงข้อความ `Something went wrong` เพียงอย่างเดียว

---

## 25. Toast & Confirmation Dialog

### Toast

ใช้สำหรับ Feedback สั้น เช่น:

- บันทึกข้อมูลเรียบร้อยแล้ว
- อัปโหลดไฟล์สำเร็จ
- ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง

Toast ไม่ใช้แทน Critical Confirmation

### Confirmation Dialog

ใช้กับ:

- Delete
- Cancel
- Reject
- Remove
- Change critical status

ข้อความต้องระบุผลลัพธ์ของ Action อย่างชัดเจน

---

## 26. Icon System

ใช้ **Lucide Icons** เป็นหลัก

```text
16px / 18px / 20px / 24px
Stroke: 1.75–2px
```

ห้ามผสม Icon Style หลายชุดโดยไม่จำเป็น

---

## 27. Motion System

```css
--coos-motion-fast: 120ms;
--coos-motion-default: 180ms;
--coos-motion-slow: 240ms;
--coos-easing: cubic-bezier(0.2, 0, 0, 1);
```

Animate เฉพาะ:

- Hover
- Dropdown
- Modal
- Tab
- Navigation indicator
- Accordion
- Toast

หลีกเลี่ยง Animation ที่ทำให้ Workflow ช้าลง

---

## 28. Responsive System

Recommended Breakpoints:

```text
Mobile: < 640px
Tablet: 640–1023px
Desktop: 1024px+
Wide: 1440px+
```

### Mobile

- 1 Column
- Primary CTA Full Width ได้
- ลด Decorative Content
- Navigation Collapse
- Table → Card/List เมื่อเหมาะสม

### Desktop

- ใช้พื้นที่กว้างขึ้น
- ห้าม Stretch Content มากเกินไป

Recommended Max Content Width:

```text
1440px
```

---

## 29. Accessibility

Minimum Requirements:

- Body Text ไม่ต่ำกว่า `14px`
- Contrast อย่างน้อย WCAG AA
- Interactive Target อย่างน้อยประมาณ `40–44px`
- Keyboard Navigation
- Visible Focus
- ไม่ใช้สีอย่างเดียวในการสื่อสถานะ
- Form Error ต้องมี Text

---

## 30. Role-Specific Design Rules

### Public

เป้าหมาย: **Editorial Creative**

ใช้:

- Large Typography
- Hero Imagery
- Editorial Grid
- Large Project Preview
- Strong White Space
- Subtle Animation

Public คือพื้นที่ที่แสดง Brand Personality มากที่สุด

### Customer

เป้าหมาย:

> **รู้สถานะงานได้ทันที และทำ Action ต่อได้ง่าย**

เน้น:

- Recent Orders
- Progress
- CTA
- Image Preview
- Deadline
- Status

ลด:

- KPI ที่ไม่จำเป็น
- Analytics ที่ไม่จำเป็น
- Fake Dashboard Metrics
- Fake Promotions
- Fake Business Data

### Editor

เป้าหมาย: **Creative Production Workspace**

เน้น:

- Assigned Work
- Deadline
- Original Assets
- Requirements
- Upload Result
- Revision
- Work History

Information Density สูงกว่า Customer ได้

### Admin

เป้าหมาย:

> **Clarity > Decoration**

เน้น:

- KPI
- Search
- Filter
- Tables
- Management
- Audit Trail
- Clear Destructive Actions

Glass และ Ambient Decoration ควรน้อยที่สุด

---

## 31. Dashboard Layout

### Customer

```text
Header / Greeting

Primary CTA

Recent Orders     Quick Information

Additional Content
```

### Admin

```text
Page Header

KPI Row

Filter / Search

Operational Data

Tables / Alerts
```

---

## 32. Page Header

Standard:

```text
Page Title
Supporting Description                     Primary Action
```

Mobile:

- Primary Action สามารถย้ายลงด้านล่างได้

---

## 33. Content Width

```text
Customer: 1100–1280px
Editor:   1200–1440px
Admin:    1280–1440px
Public:   Flexible Editorial Layout
```

---

## 34. Density Levels

### Comfortable

ใช้กับ:

- Public
- Customer

### Default

ใช้กับ:

- Editor

### Compact

ใช้กับ:

- Admin Table
- Operational Screens

ไม่ควรใช้ Compact UI กับ Customer

---

## 35. Component Naming

หากต้องการสร้าง COOS-specific components สามารถใช้:

```text
CoosButton
CoosCard
CoosBadge
CoosInput
CoosSelect
CoosModal
CoosEmptyState
CoosOrderCard
CoosImagePreview
CoosStatusBadge
```

หากระบบมี Base Component Library อยู่แล้ว ให้เน้น Design Tokens และ Variant มากกว่าการ Duplicate Component

---

## 36. Suggested CSS Tokens

```css
:root {
  --coos-bg: #f7f7f5;
  --coos-surface: #ffffff;
  --coos-surface-soft: #f3f3f1;
  --coos-surface-hover: #eeeeec;

  --coos-text-primary: #171717;
  --coos-text-secondary: #666666;
  --coos-text-muted: #929292;
  --coos-text-disabled: #b8b8b8;

  --coos-primary: #171717;
  --coos-primary-hover: #292929;
  --coos-primary-active: #0a0a0a;
  --coos-on-primary: #ffffff;

  --coos-accent: #756ce8;
  --coos-accent-soft: #f0eeff;
  --coos-accent-hover: #675ddc;

  --coos-success-text: #267a48;
  --coos-success-bg: #edf8f1;

  --coos-info-text: #3566b8;
  --coos-info-bg: #edf3ff;

  --coos-warning-text: #9a6812;
  --coos-warning-bg: #fff7e6;

  --coos-revision-text: #a34f22;
  --coos-revision-bg: #fff1e9;

  --coos-error-text: #b93b3b;
  --coos-error-bg: #fdeeee;

  --coos-radius-xs: 8px;
  --coos-radius-sm: 12px;
  --coos-radius-md: 16px;
  --coos-radius-lg: 20px;
  --coos-radius-xl: 24px;
  --coos-radius-pill: 999px;

  --coos-border: rgba(0, 0, 0, 0.06);
  --coos-border-strong: rgba(0, 0, 0, 0.10);
  --coos-divider: rgba(0, 0, 0, 0.06);

  --coos-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
  --coos-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.04);
  --coos-shadow-md: 0 8px 30px rgba(0, 0, 0, 0.05);
  --coos-shadow-floating: 0 16px 48px rgba(0, 0, 0, 0.08);

  --coos-motion-fast: 120ms;
  --coos-motion-default: 180ms;
  --coos-motion-slow: 240ms;
  --coos-easing: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 37. Do / Don't

### Do

- ใช้ Content Hierarchy ที่ชัด
- ใช้รูปภาพเป็นองค์ประกอบสำคัญ
- ใช้ Semantic Status อย่างสม่ำเสมอ
- ใช้ White Space ให้เพียงพอ
- ใช้ Design Tokens
- ทำ Responsive และ Accessibility ตั้งแต่ต้น
- ใช้ข้อมูลจริงจาก API / Seed / Backend ตาม Workflow ของระบบ

### Don't

- Glass ทุก Component
- Gradient ทุก Card
- Shadow หนัก
- Border เข้ม
- Radius ใหญ่เกินทุกจุด
- Accent หลายสี
- Fake KPI
- Fake Notification
- Fake Business Data
- UI ที่สวยแต่ไม่มีข้อมูลจริงรองรับ
- Emoji เป็น System Icon
- หลาย Icon Library ปนกัน
- Bold ทุกระดับข้อความ
- Admin UI ที่มี Decoration มากกว่า Data

---

## 38. COOS Visual Formula

### Public

**Editorial + Image + Space + Brand**

### Customer

**Soft Surface + Glass Navigation + Clear Order Status**

### Editor

**Workspace + Structured Information + Creative Preview**

### Admin

**Operational Data + Table + Search + Control**

---

## 39. Acceptance Criteria

หน้าใหม่หรือหน้าที่ Redesign ของ COOS จะถือว่าอยู่ใน Design System เมื่อผ่านอย่างน้อย:

- [ ] ใช้ Noto Sans Thai
- [ ] ใช้ COOS Color Tokens
- [ ] Primary CTA ใช้ Near Black
- [ ] Accent ไม่ถูกใช้มากเกินไป
- [ ] Radius อยู่ในระบบ Token
- [ ] Shadow เบาและสม่ำเสมอ
- [ ] Status ใช้ Semantic Color เดียวกัน
- [ ] ไม่มี Hardcoded Fake Business Data
- [ ] Empty State ถูกออกแบบ
- [ ] Loading State มี
- [ ] Error State มี
- [ ] Mobile ใช้งานได้
- [ ] Focus State มองเห็น
- [ ] รูปภาพมี Fallback
- [ ] Primary Action เด่นชัด
- [ ] Content Hierarchy อ่านง่าย
- [ ] UI ของ Role นั้นเหมาะกับงานจริง
- [ ] ไม่เปลี่ยน Business Logic เพียงเพื่อให้ UI สวยขึ้น
- [ ] ไม่เปลี่ยน API Contract โดยไม่จำเป็น

---

## 40. Final Design Identity

COOS ไม่ควรถูกนิยามว่าเป็น:

> Glassmorphism Application

แต่ควรถูกนิยามว่าเป็น:

## COOS Soft Studio

ระบบ Creative Service Platform ที่ใช้:

> **Warm neutral surfaces, refined typography, restrained color, subtle glass, premium spacing, strong imagery, and highly functional workflow UI.**

หัวใจสำคัญ:

> **Creative enough to feel like a studio.  
> Clear enough to run a real business.**

---

## 41. Recommended Project Placement

แนะนำเก็บไฟล์นี้ไว้ที่:

```text
COOS/
├── docs/
│   └── design-system/
│       └── COOS_DESIGN_SYSTEM_V1.md
├── frontend/
├── backend/
└── ...
```

เหตุผลที่ควรวางไว้ระดับ `docs/` ของ Project Root:

1. Design System นี้ครอบคลุมทั้ง Public, Customer, Editor และ Admin
2. เป็น Project-level specification ไม่ใช่ source code ของหน้าใดหน้าหนึ่ง
3. AI Coding Agent, Developer และ Designer สามารถอ้างอิงไฟล์เดียวกันได้
4. ไม่ผูกเอกสารกับ Framework หรือโครงสร้าง frontend โดยตรง
5. รองรับการเพิ่ม `v2`, accessibility spec, component spec และ UX guideline ในอนาคต

สามารถขยายโครงสร้างภายหลังเป็น:

```text
docs/
└── design-system/
    ├── COOS_DESIGN_SYSTEM_V1.md
    ├── COMPONENT_GUIDELINES.md
    ├── STATUS_SYSTEM.md
    ├── RESPONSIVE_GUIDELINES.md
    └── ACCESSIBILITY_GUIDELINES.md
```

---

## 42. Implementation Rule

ก่อนสร้างหรือ Redesign หน้า COOS ให้ใช้เอกสารนี้เป็น Visual Source of Truth

ลำดับความสำคัญ:

1. Existing Business Logic
2. Existing API Contract
3. Existing Auth / Permission / Workflow
4. COOS Design System
5. Page-specific visual decisions

หาก Design System ขัดกับ Business Logic หรือ Workflow จริง:

> **รักษา Business Logic และ Workflow เดิม แล้วปรับ Visual Design ให้เหมาะสม**

ไม่ควรเปลี่ยน Logic เพื่อบังคับให้เข้ากับ Mockup
