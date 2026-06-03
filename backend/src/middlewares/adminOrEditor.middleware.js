// Middleware: อนุญาตเฉพาะ Admin หรือ Editor เท่านั้น (ปรับปรุง)
module.exports = (req, res, next) => {
  const role = req.session?.userRole;
  // ตรวจสอบว่ามี session และ role เป็น admin หรือ editor หรือไม่
  if (!req.session || (role !== "admin" && role !== "editor")) {
    return res.status(403).json({
      message: "เฉพาะผู้ดูแลระบบ (Admin) หรือ Editor เท่านั้นที่มีสิทธิ์เข้าถึง",
    });
  }
  next();
};
