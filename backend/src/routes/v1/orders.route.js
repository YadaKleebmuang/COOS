const express = require("express");
const router = express.Router();
const controller = require("../../controllers/orderController");

// routes สำหรับจัดการคำสั่งซื้อ (Orders)
router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.patch("/:id/status", controller.updateStatus);
router.patch("/:id/assign", controller.assignEditor);

router.post("/:id/images", controller.uploadImage);
router.post("/:id/payments", controller.submitPayment);
router.patch("/:id/payments/:paymentId", controller.verifyPayment);

module.exports = router;
