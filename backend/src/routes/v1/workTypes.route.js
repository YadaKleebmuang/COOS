const express = require("express");
const router = express.Router();
const controller = require("../../controllers/workTypeController");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminOnly = require("../../middlewares/admin.middleware");

// routes สำหรับ work types
router.get("/", controller.getAll);

// Admin only
router.post("/", authMiddleware, adminOnly, controller.create);
router.patch("/:id", authMiddleware, adminOnly, controller.update);
router.delete("/:id", authMiddleware, adminOnly, controller.remove);

module.exports = router;
