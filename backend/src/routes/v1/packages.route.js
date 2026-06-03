const express = require("express");
const router = express.Router();
const controller = require("../../controllers/packageController");
const adminOnly = require("../../middlewares/admin.middleware");

// routes สำหรับ packages
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin only
router.post("/", adminOnly, controller.create);
router.patch("/:id", adminOnly, controller.update);
router.delete("/:id", adminOnly, controller.delete);

module.exports = router;
