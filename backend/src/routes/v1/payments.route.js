const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth.middleware");

// All routes require admin
router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/", paymentController.getPayments);
router.patch("/:id/approve", paymentController.approvePayment);
router.patch("/:id/reject", paymentController.rejectPayment);

module.exports = router;
