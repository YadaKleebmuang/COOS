const express = require("express");
const controller = require("../../controllers/user.controller");

const router = express.Router();

// route ย่อยสำหรับ user (เช่น ดึงข้อมูล user, สร้าง user, ลบ user, อัปเดต user)
router.get("/", controller.getUsers);
router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.delete("/:id", controller.deleteUser);
router.patch("/:id", controller.updateUser);

module.exports = router;
