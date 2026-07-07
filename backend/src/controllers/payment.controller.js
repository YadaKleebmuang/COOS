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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const adminId = req.session.userId;

    const payment = await PaymentModel.findById(id);
    if (!payment) {
      await connection.rollback();
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "pending") {
      await connection.rollback();
      return res.status(400).json({ message: "Payment is already processed" });
    }

    // Update payment status
    await PaymentModel.updateStatus(id, "approved", adminId, connection);

    // Update Order Status based on payment type
    let nextStatus = null;
    let logNote = "";

    if (payment.paymentType === "deposit") {
      nextStatus = "waiting_assignment";
      logNote = "ตรวจสอบการชำระเงินมัดจำเรียบร้อยแล้ว";
    } else if (payment.paymentType === "final") {
      nextStatus = "delivered";
      logNote = "ตรวจสอบการชำระเงินส่วนที่เหลือเรียบร้อยแล้ว ส่งมอบงาน";
    }

    if (nextStatus) {
      await connection.query(
        `UPDATE orders SET orderStatus = ? WHERE orderId = ?`,
        [nextStatus, payment.orderId]
      );

      await connection.query(
        `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
         VALUES (?, ?, ?, ?, ?)`,
        [payment.orderId, payment.orderStatus, nextStatus, adminId, logNote]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "Payment approved successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// PATCH /payments/:id/reject
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.userId;
    const { reason } = req.body;

    const payment = await PaymentModel.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Payment is already processed" });
    }

    await PaymentModel.updateStatus(id, "rejected", adminId);

    // Optional: Log to workflowLogs if you want to record the rejection reason
    await pool.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, ?, ?, ?, ?)`,
      [payment.orderId, payment.orderStatus, payment.orderStatus, adminId, `ปฏิเสธการชำระเงิน: ${reason || 'ไม่ระบุเหตุผล'}`]
    );

    res.status(200).json({ message: "Payment rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
