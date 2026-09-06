const express = require("express");
const controller = require("../../controllers/policy.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authMiddleware(req, res, next);
};

// Public routes — ดึง policies สำหรับแสดงในหน้าเว็บ
router.get("/", optionalAuth, controller.getPolicies);
router.get("/type/:type", controller.getPolicyByType);
router.get("/:id", optionalAuth, controller.getPolicyById);

// Admin only routes — ต้อง login + ต้องเป็น admin
router.post("/", authMiddleware, adminOnly, controller.createPolicy);
router.patch("/:id", authMiddleware, adminOnly, controller.updatePolicy);
router.delete("/:id", authMiddleware, adminOnly, controller.deletePolicy);

module.exports = router;
