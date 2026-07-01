const express = require("express");
const router = express.Router();
const settingController = require("../../controllers/setting.controller");
const adminOnly = require("../../middlewares/admin.middleware");

// authMiddleware applied globally in index.js — only need adminOnly here
router.use(adminOnly);

router.get("/", settingController.getSettings);
router.patch("/", settingController.updateSystemSettings);

module.exports = router;
