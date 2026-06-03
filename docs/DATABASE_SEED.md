# Sample Data & Example Queries

เอกสารนี้ใช้สำหรับเก็บข้อมูลตัวอย่าง (Seed Data) และตัวอย่าง Query สำหรับระบบ COOS

---

## Sample Users

เพิ่มข้อมูลผู้ใช้ตัวอย่าง

```sql
INSERT INTO `users`
(`userFirstName`, `userLastName`, `userEmail`, `userPassword`, `userPhone`, `userAddress`, `userRole`)
VALUES
('Admin', 'User', 'admin@coos.com', '123123', '0800000001', '123 Admin Street', 'admin'),
('John', 'Doe', 'john@example.com', '123123', '0812345678', '456 Main Street', 'customer'),
('Jane', 'Smith', 'jane@example.com', '123123', '0887654321', '789 Oak Avenue', 'editor');
```

---

## Work Types

เพิ่มประเภทงานถ่ายภาพ

```sql
INSERT INTO `worktypes`
(`workTypeName`)
VALUES
('Pre-wedding'),
('รับปริญญา'),
('Portrait'),
('ครอบครัว');
```

---

## Packages

เพิ่มข้อมูลแพ็กเกจบริการ

```sql
INSERT INTO `packages`
(
  `packageName`,
  `packageImageCount`,
  `packageResolution`,
  `packageDeliveryDays`,
  `packagePrice`
)
VALUES
('Basic', 10, 'FullHD', 5, 199.00),
('Standard', 20, 'FullHD', 7, 399.00),
('Pro', 30, '4K', 10, 599.00);
```

---

# Example Queries

## Gallery Images พร้อมประเภทงาน

ดึงข้อมูลรูปภาพใน Gallery พร้อมประเภทงาน

```sql
SELECT
  gi.imageId,
  gi.imageTitle,
  gi.imageUrl,
  gi.imageTags,
  wt.workTypeName
FROM galleryImages gi
JOIN workTypes wt
  ON gi.workTypeId = wt.workTypeId
WHERE gi.imageIsActive = 1;
```

---

## Filter ตามประเภทงานและ Tag

ตัวอย่างการค้นหารูปภาพตามประเภทงานและ Tag

```sql
SELECT gi.*
FROM galleryImages gi
WHERE gi.workTypeId = 1
  AND gi.imageTags LIKE '%anime%';
```

### ตัวอย่างผลลัพธ์

ค้นหารูปภาพที่

* อยู่ในประเภทงาน `workTypeId = 1`
* มี Tag คำว่า `anime`

เหมาะสำหรับระบบค้นหารูปภาพใน Portfolio Gallery

---

# หมายเหตุ

* ใช้สำหรับ Development และ Testing
* ไม่ควรใช้รหัสผ่านแบบ Plain Text ใน Production
* ในระบบจริงควร Hash Password ก่อนบันทึกลงฐานข้อมูล
* ควรใช้ระบบ Tag แบบ Relation Table แทนการเก็บเป็น String หากข้อมูลมีจำนวนมาก

````

## Suggested File Location

```text
COOS/
└── docs/
    └── DATABASE_SEED.md
````

หรือ

```text
COOS/
└── docs/
    └── SAMPLE_DATA.md
```
