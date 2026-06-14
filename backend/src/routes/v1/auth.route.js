const express = require("express");
const controller = require("../../controllers/auth.controller");
const router = express.Router();

// route ย่อยสำหรับการยืนยันตัวตน (เช่น register, login)
router.post("/login", controller.login);
router.post("/register", controller.register);

// Password Recovery
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

module.exports = router;