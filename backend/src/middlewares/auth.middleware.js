const jwt = require("jsonwebtoken");

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // session จาก JWT
    req.session = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
