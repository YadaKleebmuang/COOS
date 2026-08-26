const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ตรวจสอบว่ามีการส่ง token มาหรือไม่
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // แยกเอาเฉพาะ token ออกมา
  const token = authHeader.split(" ")[1];

  try {
    // ตรวจสอบความถูกต้องของ token
    const decoded = jwt.verify(token, getJwtSecret());

    // session จาก JWT
    req.session = decoded;

    next();
  } catch (err) {
    if (err.code === "CONFIG_MISSING_JWT_SECRET") {
      return next(err);
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
