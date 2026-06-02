# Git Workflow สำหรับโปรเจกต์ COOS

> Workflow สำหรับโปรเจกต์ที่ทำคนเดียว โดยใช้ Nuxt (Frontend) + FastAPI (Backend)

---

# โครงสร้าง Branch

```text
main
├── feature/frontend
└── feature/backend
```

## ความหมายของแต่ละ Branch

### main

ใช้เก็บโค้ดที่

* รันได้
* ไม่พัง
* พร้อม Demo
* พร้อมส่งอาจารย์

**ห้ามพัฒนาโดยตรงบน main**

---

### feature/frontend

ใช้พัฒนา

* Pages
* Components
* UI/UX
* Tailwind CSS
* Frontend Logic
* API Integration

ตัวอย่างไฟล์

```text
frontend/pages/
frontend/components/
frontend/assets/
```

---

### feature/backend

ใช้พัฒนา

* FastAPI
* Database
* Models
* Services
* CRUD
* Recommendation Algorithm
* Chatbot API

ตัวอย่างไฟล์

```text
backend/routes/
backend/models/
backend/services/
backend/database/
```

---

# Workflow การทำงาน

## 1. เริ่มงาน

อัปเดต main ก่อนทุกครั้ง

```bash
git checkout main
git pull origin main
```

---

## 2. สลับไป Branch ที่ต้องการ

### ทำ Frontend

```bash
git checkout feature/frontend
```

### ทำ Backend

```bash
git checkout feature/backend
```

---

## 3. พัฒนา Feature

### Frontend

แก้ไขไฟล์

```text
frontend/pages/home.vue
frontend/components/Navbar.vue
```

---

### Backend

แก้ไขไฟล์

```text
backend/routes/recommend.py
backend/services/recommendation.py
```

---

## 4. Commit

### Frontend

```bash
git add .
git commit -m "feat(frontend): create homepage"
```

---

### Backend

```bash
git add .
git commit -m "feat(backend): add recommendation endpoint"
```

---

## 5. Push

### Frontend

```bash
git push origin feature/frontend
```

---

### Backend

```bash
git push origin feature/backend
```

---

## 6. Merge กลับ Main

เมื่อ Feature ทำเสร็จและทดสอบแล้ว

```bash
git checkout main
git pull origin main
git merge feature/frontend
git push origin main
```

หรือ

```bash
git checkout main
git pull origin main
git merge feature/backend
git push origin main
```

---

# Commit Message Convention

## Feature

ใช้เมื่อเพิ่มฟีเจอร์ใหม่

```text
feat(frontend): create dashboard page
feat(frontend): add login form

feat(backend): create user model
feat(backend): add recommendation api
```

---

## Fix

ใช้เมื่อแก้บั๊ก

```text
fix(frontend): navbar responsive issue
fix(backend): handle invalid budget
```

---

## Style

ใช้เมื่อแก้เฉพาะ UI หรือ CSS

```text
style(frontend): improve homepage layout
style(frontend): update button spacing
```

---

## Refactor

ใช้เมื่อปรับปรุงโค้ดโดยไม่เพิ่มฟีเจอร์

```text
refactor(backend): simplify service logic
refactor(frontend): improve component structure
```

---

## Documentation

ใช้เมื่อแก้ README หรือเอกสาร

```text
docs: update README
docs: add installation guide
```

---

# ตัวอย่างการทำงานจริง

## วันแรก

ทำหน้า Homepage

```bash
git checkout feature/frontend
```

แก้ไข

```text
frontend/pages/home.vue
frontend/components/Navbar.vue
```

Commit

```bash
git add .
git commit -m "feat(frontend): create homepage"
git push origin feature/frontend
```

---

## วันที่สอง

ทำ Recommendation API

```bash
git checkout feature/backend
```

แก้ไข

```text
backend/routes/recommend.py
```

Commit

```bash
git add .
git commit -m "feat(backend): add recommendation endpoint"
git push origin feature/backend
```

---

## วันที่สาม

รวม Frontend เข้า Main

```bash
git checkout main
git pull origin main
git merge feature/frontend
git push origin main
```

---

# VS Code Source Control Workflow

## สร้าง Branch

1. คลิกชื่อ Branch มุมล่างซ้าย
2. เลือก Create New Branch
3. ตั้งชื่อ

```text
feature/frontend
```

หรือ

```text
feature/backend
```

---

## Commit

1. เปิด Source Control
2. ใส่ Commit Message
3. กด ✓ Commit

---

## Push

กด

```text
Push
```

หรือ

```text
Sync Changes
```

---

## เปลี่ยน Branch

คลิกชื่อ Branch มุมล่างซ้าย

เลือก

```text
main
feature/frontend
feature/backend
```

---

# กฎสำคัญ

✅ Pull ก่อนเริ่มงานทุกครั้ง

```bash
git pull origin main
```

✅ ใช้ Branch สำหรับพัฒนาเสมอ

```text
feature/frontend
feature/backend
```

✅ Commit บ่อย ๆ

✅ เขียน Commit Message ให้สื่อความหมาย

✅ Merge เข้า main เฉพาะโค้ดที่ทดสอบแล้ว

❌ ห้ามพัฒนาโดยตรงบน main

❌ ห้าม Commit node_modules หรือไฟล์ build

---

# เป้าหมาย

ให้ main เป็น Branch ที่พร้อมใช้งานตลอดเวลา

```text
main = Stable Version
feature/frontend = Frontend Development
feature/backend = Backend Development
```

Workflow นี้เรียบง่าย เหมาะกับโปรเจกต์ COOS และสอดคล้องกับแนวทางที่ใช้จริงในงานพัฒนาซอฟต์แวร์
