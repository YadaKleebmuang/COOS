const PaymentModel = require("../models/payment.model");
const OrderModel = require("../models/orderModel"); // For logging workflow or updating order
const { pool } = require("../config/db");

// GET /payments
exports.getPayments = async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending
    const payments = await PaymentModel.findAll({ status });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /payments/:id/approve
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.userId;

    const payment = await PaymentModel.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Payment is already processed" });
    }

    // Use OrderModel.verifyPayment as single source of truth
    const result = await OrderModel.verifyPayment(
      id,
      "approved",
      adminId,
      "ตรวจสอบการชำระเงินเรียบร้อยแล้ว"
    );

    res.status(200).json({ 
      message: "Payment approved successfully",
      nextOrderStatus: result.nextStatus 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /payments/:id/reject
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.userId;
    const { reason } = req.body || {};

    const payment = await PaymentModel.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Payment is already processed" });
    }

    // Use OrderModel.verifyPayment as single source of truth
    const result = await OrderModel.verifyPayment(
      id,
      "rejected",
      adminId,
      `ปฏิเสธการชำระเงิน: ${reason || 'ไม่ระบุเหตุผล'}`
    );

    res.status(200).json({ 
      message: "Payment rejected successfully",
      nextOrderStatus: result.nextStatus 
    });
  } catch (err) {
    console.error("Reject Payment Error:", err);
    res.status(500).json({ message: err.message }); // Removed stack: err.stack as part of BUG-09
  }
};
