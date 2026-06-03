const express = require("express");
const controller = require("../../controllers/user.controller");
const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

// route ย่อยสำหรับ user
router.get("/", controller.getUsers);
router.get("/:id", controller.getUserById);

// Admin only
router.post("/", adminOnly, controller.createUser);
router.patch("/:id", adminOnly, controller.updateUser);
router.delete("/:id", adminOnly, controller.deleteUser);

module.exports = router;
