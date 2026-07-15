const multer = require("multer");

// Middleware จัดการ error จากการอัปโหลดไฟล์
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error จาก multer
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "ไฟล์มีขนาดใหญ่เกินไป" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "ชื่อ field ไม่ถูกต้อง" });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err) {
    // Error จาก fileFilter หรืออื่นๆ
    return res.status(400).json({ message: err.message });
  }

  next();
};

const fs = require('fs');

const validateMagicBytes = async (req, res, next) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next(); // ไม่มีไฟล์ให้อัปโหลด
  }

  try {
    const fileType = await import('file-type'); // file-type@16 is CJS, wait, v16 is CJS so we can use require.
    // Actually, I installed v16.5.4, let's just require it.
    const FileType = require('file-type');
    
    const filesToCheck = req.file ? [req.file] : req.files;
    
    for (const file of filesToCheck) {
      if (!file.path) continue;
      
      const buffer = fs.readFileSync(file.path);
      const type = await FileType.fromBuffer(buffer);
      
      if (!type || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type.mime)) {
        // ลบไฟล์ทิ้งถ้าปลอมแปลงมา
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: "ประเภทไฟล์ไม่ถูกต้อง หรือมีการปลอมแปลงนามสกุลไฟล์" });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบไฟล์" });
  }
};

module.exports = {
  handleUploadError,
  validateMagicBytes
};
