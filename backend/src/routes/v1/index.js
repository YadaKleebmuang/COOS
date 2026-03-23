const express = require("express");
const userRoutes = require("./user.route");
const auth = require("./auth.route");
const packageRoutes = require("./packages.route");
const workTypeRoutes = require("./workTypes.route");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// index คือการรวบรวม route ย่อยทั้งหมดไว้
router.use("/auth", auth);

// ทุก route หลังจากนี้ต้อง login
router.use(authMiddleware);

router.use("/users", userRoutes);
router.use("/packages", packageRoutes);
router.use("/work-types", workTypeRoutes);

module.exports = router;
