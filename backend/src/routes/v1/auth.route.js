const express = require("express");
const controller = require("../../controllers/auth.controller");
const { authLimiter } = require("../../middlewares/rateLimit.middleware");
const router = express.Router();

// Apply authLimiter to all auth routes
router.use(authLimiter);

// route ย่อยสำหรับการยืนยันตัวตน (เช่น register, login)
router.post("/login", controller.login);
router.post("/register", controller.register);


module.exports = router;