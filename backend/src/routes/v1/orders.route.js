const express = require("express");
const router = express.Router();
const controller = require("../../controllers/orderController");

// routes สำหรับจัดการคำสั่งซื้อ (Orders)
router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/prompt-notes", controller.getPromptNotes);
router.get("/:id", controller.getById);

router.patch("/:id/status", controller.updateStatus);
router.patch("/:id/assign", controller.assignEditor);

router.post("/:id/images", controller.uploadImage);
router.patch("/:id/images/select", controller.selectImages);

router.post("/:id/payments", controller.submitPayment);
router.patch("/:id/payments/:paymentId", controller.verifyPayment);

module.exports = router;
