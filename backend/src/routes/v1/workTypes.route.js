const express = require("express");
const router = express.Router();
const controller = require("../../controllers/workTypeController");
const adminOnly = require("../../middlewares/admin.middleware");

// routes สำหรับ work types
router.get("/", controller.getAll);

// Admin only
router.post("/", adminOnly, controller.create);
router.patch("/:id", adminOnly, controller.update);
router.delete("/:id", adminOnly, controller.remove);

module.exports = router;
