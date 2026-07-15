const express = require("express");
const controller = require("../../controllers/user.controller");
const adminOnly = require("../../middlewares/admin.middleware");
const { uploadProfile } = require("../../config/upload");

const router = express.Router();

// route ย่อยสำหรับ user

const { validateMagicBytes } = require("../../middlewares/upload.middleware");

// /me routes — ต้องอยู่ก่อน /:id เพื่อไม่ให้ "me" ถูกตีความเป็น id
router.get("/me", controller.getMyProfile);
router.patch("/me", uploadProfile.single("profileImage"), validateMagicBytes, controller.updateMyProfile);

router.get("/", adminOnly, controller.getUsers);
router.get("/:id", adminOnly, controller.getUserById);

// Admin only
router.post("/", adminOnly, controller.createUser);
router.patch("/:id", adminOnly, controller.updateUser);
router.delete("/:id", adminOnly, controller.deleteUser);

module.exports = router;
