const express = require("express");
const controller = require("../../controllers/auth.controller");
const router = express.Router();

// route ย่อยสำหรับการยืนยันตัวตน (เช่น register, login)
router.post("/login", controller.login);
router.post("/register", controller.register);

module.exports = router;