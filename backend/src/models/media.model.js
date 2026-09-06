const { pool } = require("../config/db");

exports.findGalleryImage = async (imageId) => {
  const [rows] = await pool.query(
    "SELECT imageId, imageUrl, imageIsActive FROM galleryImages WHERE imageId = ?",
    [imageId],
  );
  return rows[0];
};

exports.findOrderImage = async (orderImageId) => {
  const [rows] = await pool.query(
    `SELECT oi.orderImageId, oi.imageUrl, oi.imageType,
            o.orderId, o.customerId, o.editorId, o.orderStatus
     FROM orderImages oi
     JOIN orders o ON o.orderId = oi.orderId
     WHERE oi.orderImageId = ?`,
    [orderImageId],
  );
  return rows[0];
};

exports.findPaymentSlip = async (paymentId) => {
  const [rows] = await pool.query(
    `SELECT p.paymentId, p.paymentSlipUrl, o.customerId
     FROM payments p
     JOIN orders o ON o.orderId = p.orderId
     WHERE p.paymentId = ?`,
    [paymentId],
  );
  return rows[0];
};

exports.findProfileImage = async (userId) => {
  const [rows] = await pool.query(
    "SELECT userId, userProfileImage FROM users WHERE userId = ?",
    [userId],
  );
  return rows[0];
};
