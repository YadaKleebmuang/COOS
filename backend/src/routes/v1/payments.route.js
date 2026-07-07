const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/payment.controller");
const adminOnly = require("../../middlewares/admin.middleware");

// authMiddleware applied globally in index.js — only need adminOnly here
router.use(adminOnly);

router.get("/", paymentController.getPayments);
router.patch("/:id/approve", paymentController.approvePayment);
router.patch("/:id/reject", paymentController.rejectPayment);

module.exports = router;
