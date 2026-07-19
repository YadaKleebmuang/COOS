const path = require("path");

/**
 * POST /api/v1/upload
 * รับไฟล์รูปภาพ 1 ไฟล์ (field: "image") แล้วส่ง URL กลับ
 * ต้องผ่าน auth middleware ก่อน (ใน index.js)
 */
exports.uploadSingle = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" });
    }

    // สร้าง public URL สำหรับเข้าถึงไฟล์
    // ไม่ใช้ req.get("host") เพื่อป้องกัน Host Header Injection
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "อัปโหลดไฟล์สำเร็จ",
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/v1/upload/multiple
 * รับไฟล์หลายไฟล์ (field: "images", max 10) แล้วส่ง URL array กลับ
 */
exports.uploadMultiple = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์" });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

    const files = req.files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.status(201).json({
      message: `อัปโหลดสำเร็จ ${files.length} ไฟล์`,
      files,
    });
  } catch (err) {
    return next(err);
  }
};
