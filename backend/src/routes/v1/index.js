const express = require("express");
const userRoutes = require("./user.route");
const auth = require("./auth.route");
const packageRoutes = require("./packages.route");
const workTypeRoutes = require("./workTypes.route");
const orderRoutes = require("./orders.route");
const galleryImageRoutes = require("./galleryImages.route");
const policyRoutes = require("./policies.route");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// index คือการรวบรวม route ย่อยทั้งหมดไว้
router.use("/auth", auth);

// Public routes — ไม่ต้อง login สำหรับ GET (admin routes ป้องกันด้วย middleware ที่ route level)
router.use("/gallery-images", galleryImageRoutes);
router.use("/policies", policyRoutes);

// ทุก route หลังจากนี้ต้อง login
router.use(authMiddleware);

router.use("/users", userRoutes);
router.use("/packages", packageRoutes);
router.use("/work-types", workTypeRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
