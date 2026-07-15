const express = require("express");
const router = express.Router();
const controller = require("../../controllers/packageController");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminOnly = require("../../middlewares/admin.middleware");

// Public routes (ไม่ต้อง Login) - ถูกเรียกใช้ก่อน global authMiddleware ใน index.js
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin only
router.post("/", authMiddleware, adminOnly, controller.create);
router.patch("/:id", authMiddleware, adminOnly, controller.update);
router.delete("/:id", authMiddleware, adminOnly, controller.delete);

module.exports = router;
