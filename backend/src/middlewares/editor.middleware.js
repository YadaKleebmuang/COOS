// Middleware: อนุญาตเฉพาะ Editor เท่านั้น
module.exports = (req, res, next) => {
  if (req.session?.userRole !== "editor") {
    return res.status(403).json({
      message: "เฉพาะ Editor เท่านั้นที่มีสิทธิ์เข้าถึง",
    });
  }
  next();
};
