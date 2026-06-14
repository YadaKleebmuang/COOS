// Middleware: อนุญาตเฉพาะ Admin เท่านั้น (ปรับปรุง)
module.exports = (req, res, next) => {
  if (req.session?.userRole !== "admin") {
    return res.status(403).json({
      message: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์เข้าถึง",
    });
  }
  next();
};
