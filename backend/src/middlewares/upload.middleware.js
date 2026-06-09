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

module.exports = handleUploadError;
