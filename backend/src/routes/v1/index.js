const express = require("express");
const userRoutes = require("./user.route");
const productRoutes = require("./product.route");
const auth = require("./auth.route");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// index คือการรวบรวม route ย่อยทั้งหมดไว้
router.use("/auth", auth);

// ทุก route หลังจากนี้ต้อง login
router.use(authMiddleware);

router.use("/users", userRoutes);
router.use("/products", productRoutes);

module.exports = router;
