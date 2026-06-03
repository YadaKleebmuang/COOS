# Git Workflow สำหรับโปรเจกต์ COOS

เอกสารแนะนำขั้นตอนการใช้งาน Git และ Docker สำหรับการพัฒนาร่วมกันในโปรเจกต์ COOS

---

## 📌 Branch Structure

```text
main
├── feature/frontend
├── feature/backend
└── chore/config
```

---

## ⚙️ Branch Responsibilities

### 🔹 `main`
* **วัตถุประสงค์:** เก็บโค้ดเวอร์ชันหลักที่เสถียร พร้อมสำหรับการทำ Demo และ Deploy
* **ข้อกำหนด:**
  * ❌ **ห้ามพัฒนาหรือ Commit โดยตรงบน Branch นี้**
  * ✅ รับโค้ดผ่านการสร้าง **Pull Request** เท่านั้น

### 🔹 `feature/frontend`
* **วัตถุประสงค์:** ใช้สำหรับพัฒนาส่วน Nuxt Frontend:
  * Pages / Components / UI/UX
  * Frontend Services & State Management
* **ตัวอย่างโฟลเดอร์/ไฟล์:**
  * `frontend/pages/`
  * `frontend/components/`
  * `frontend/app/`
  * `frontend/composables/`

### 🔹 `feature/backend`
* **วัตถุประสงค์:** ใช้สำหรับพัฒนาส่วน FastAPI Backend:
  * API Endpoints / Business Logic
  * Database Logic & Models / Authentication
  * Recommendation System
* **ตัวอย่างโฟลเดอร์/ไฟล์:**
  * `backend/src/routes/`
  * `backend/src/controllers/`
  * `backend/src/services/`
  * `backend/src/models/`

### 🔹 `chore/config`
* **วัตถุประสงค์:** ใช้สำหรับจัดการ Configuration และ Infrastructure:
  * Docker & Docker Compose
  * Environment Variables (.env)
  * Build & Deployment Configuration
* **ตัวอย่างโฟลเดอร์/ไฟล์:**
  * `docker-compose.yml`
  * `backend/Dockerfile`
  * `frontend/Dockerfile`
  * `.env.example`

---

## 🔄 Daily Workflow (ขั้นตอนการทำงานในแต่ละวัน)

### 1. ตรวจสอบ Branch ปัจจุบัน
ตรวจสอบว่าทำงานอยู่บน Branch ที่ถูกต้องหรือไม่:
```bash
git branch
```
*ตัวอย่างผลลัพธ์:* `* feature/backend`

### 2. สลับไปยัง Branch ที่ต้องการพัฒนา
* **ทำ Frontend:**
  ```bash
  git checkout feature/frontend
  ```
* **ทำ Backend:**
  ```bash
  git checkout feature/backend
  ```
* **ทำ Config / Docker:**
  ```bash
  git checkout chore/config
  ```

### 3. ดึงข้อมูลล่าสุด (Pull)
แนะนำให้ทำทุกครั้งก่อนเริ่มเขียนโค้ด (หรือกดปุ่ม Pull ใน VS Code):
* **Frontend:**
  ```bash
  git pull origin feature/frontend
  ```
* **Backend:**
  ```bash
  git pull origin feature/backend
  ```
* **Config:**
  ```bash
  git pull origin chore/config
  ```

### 4. เริ่มพัฒนา
* แก้ไขหรือพัฒนาไฟล์ต่างๆ ตามงานที่ได้รับมอบหมาย

### 5. ตรวจสอบสถานะ
ตรวจดูไฟล์ที่มีการเปลี่ยนแปลงก่อนนำไป Commit:
```bash
git status
```

### 6. Commit งาน
1. เพิ่มไฟล์ที่แก้ไขเข้าสู่ Staging Area:
   ```bash
   git add .
   ```
2. บันทึกประวัติการพัฒนา (Commit):
   ```bash
   git commit -m "feat(backend): add order creation endpoint"
   ```

### 7. Push งานขึ้น GitHub
* **Frontend:**
  ```bash
  git push origin feature/frontend
  ```
* **Backend:**
  ```bash
  git push origin feature/backend
  ```
* **Config:**
  ```bash
  git push origin chore/config
  ```

---

## 📝 Commit Message Convention

ใช้หลักการเขียน Commit Message ให้มีความหมายและชัดเจนตามประเภทงาน:

| ประเภท | รูปแบบ / ตัวอย่าง |
| :--- | :--- |
| **Feature (ฟีเจอร์ใหม่)** | `feat(frontend): create dashboard page`<br>`feat(backend): create order endpoint`<br>`feat(backend): add recommendation api` |
| **Bug Fix (แก้บั๊ก)** | `fix(frontend): navbar responsive issue`<br>`fix(backend): handle invalid budget` |
| **Refactor (ปรับปรุงโค้ด)** | `refactor(backend): simplify service logic`<br>`refactor(frontend): improve component structure` |
| **Documentation (เอกสาร)** | `docs: update git workflow`<br>`docs: add docker setup guide` |
| **Configuration (ตั้งค่า)** | `chore(config): add docker compose`<br>`chore(config): configure mysql container`<br>`chore(config): migrate from xampp to docker` |

---

## 🔀 Pull Request Workflow

### เมื่อพัฒนางานใน Branch เสร็จสิ้น
สร้าง Pull Request (PR) เพื่อรวมโค้ดเข้าสู่ Branch `main`:

```text
[feature/frontend] ──สร้าง PR──> [main]
[feature/backend]  ──สร้าง PR──> [main]
[chore/config]     ──สร้าง PR──> [main]
```

### หลังทำการ Merge สำเร็จ
เมื่อ GitHub แสดงข้อความ `Pull request successfully merged and closed`:
1. โค้ดถูกนำเข้าสู่ Branch `main` เรียบร้อยแล้ว
2. สามารถลบ Branch ย่อยนั้นทิ้งได้หากไม่ใช้งานต่อ

### การ Sync Branch อื่นๆ หลัง Merge (สำคัญมาก)
เมื่อมีการ Merge โค้ด (เช่น จาก `chore/config` เข้า `main`) เรียบร้อยแล้ว หากจะทำงานบน Branch อื่นต่อ (เช่น `feature/backend`) จะต้องดึงอัปเดตล่าสุดจาก `main` มาอัปเดต Branch ตัวเองก่อนเสมอ:
```bash
git checkout feature/backend
git pull origin main
# หรือ git merge main เพื่อให้ได้โค้ดชุดล่าสุด
```

---

## 🐳 Docker Workflow

ก่อนเริ่มรัน Docker ให้ทำตามขั้นตอนดังนี้:

1. **ตรวจสอบความถูกต้อง:** ตรวจสอบให้แน่ใจว่าอยู่ที่ Root Directory ของโปรเจกต์ (`COOS/`)
   ```text
   COOS/
   ├── backend/
   ├── frontend/
   └── docker-compose.yml
   ```
2. **รันคำสั่ง Docker:**
   ```bash
   docker compose up --build
   ```
   > 💡 **หมายเหตุ:** สามารถรันได้จากทุก Branch ไม่ว่าจะเป็น `main`, `feature/frontend`, หรือ `feature/backend` โดย Docker จะใช้ไฟล์จาก Branch ปัจจุบันที่คุณสลับไว้ (Checkout)

---

## 📋 Checklist & Rules

### ✅ สิ่งที่ควรทำ (Rules)
* [ ] **Pull ทุกครั้ง** ก่อนเริ่มต้นทำงาน เพื่ออัปเดตโค้ดล่าสุด
* [ ] **Commit บ่อยๆ** แบ่งเป็นงานชิ้นเล็กๆ เพื่อให้ติดตามการแก้ไขง่าย
* [ ] **Push ก่อนเลิกงาน** เพื่อป้องกันงานสูญหายและอัปเดตให้คนในทีม
* [ ] **ใช้ Branch แยกตามประเภทงาน** (`frontend`, `backend`, `config`)
* [ ] **Merge ผ่าน Pull Request เท่านั้น** เพื่อให้มีการรีวิวโค้ด
* [ ] **เขียน Commit Message** ให้สื่อความหมายตรงกับการแก้ไข

### ❌ สิ่งที่ห้ามทำ (Don'ts)
* 🚫 **ห้าม Commit ไฟล์ `.env`** ขึ้น GitHub โดยเด็ดขาด (ใช้ `.env.example` แทน)
* 🚫 **ห้าม Commit โฟลเดอร์ `node_modules`** หรือ dependencies อื่นๆ
* 🚫 **ห้ามพัฒนาหรือแก้ไขโค้ดตรงๆ บน Branch `main`**
* 🚫 **ห้ามลืม Push งาน** ขึ้น Git ก่อนปิดเครื่องเลิกงาน

---

## ⚡ Quick Workflow Diagram

```text
[เริ่มงาน]
   │
   ▼
[Checkout Branch]
   │
   ▼
[Pull โค้ดล่าสุด]
   │
   ▼
[เขียนโค้ด / พัฒนา]
   │
   ▼
[git add .]
   │
   ▼
[Commit งาน]
   │
   ▼
[Push ขึ้น GitHub]
   │
   ▼
[สร้าง Pull Request]
   │
   ▼
[Merge เข้า main]
   │
   ▼
[Sync Branch อื่นๆ]
   │
   ▼
[จบงาน / ปิดเครื่อง]
```