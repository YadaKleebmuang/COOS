const express = require("express");
const router = express.Router();
const settingController = require("../../controllers/setting.controller");
const { authorizeRoles } = require("../../middlewares/auth.middleware");

// Get settings - Can be accessed by anyone or just admins depending on requirements
// For now, let's say anyone logged in can read settings (or at least admins/editors)
router.get("/", settingController.getSettings);

// Update settings - Only admin
router.patch("/", authorizeRoles("admin"), settingController.updateSystemSettings);

module.exports = router;
