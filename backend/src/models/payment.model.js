const { pool } = require("../config/db");

// Find all payments with optional status filter
exports.findAll = async ({ status }) => {
  let sql = `
    SELECT p.*, 
           o.orderTotalPrice, o.orderStatus,
           c.userFirstName as customerFirstName, c.userLastName as customerLastName, c.userEmail,
           a.userFirstName as adminFirstName, a.userLastName as adminLastName
    FROM payments p
    JOIN orders o ON p.orderId = o.orderId
    JOIN users c ON o.customerId = c.userId
    LEFT JOIN users a ON p.verifiedByAdminId = a.userId
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += " AND p.paymentStatus = ?";
    params.push(status);
  }

  sql += " ORDER BY p.paymentCreatedAt DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
};

// Find payment by ID
exports.findById = async (paymentId) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.orderStatus 
     FROM payments p 
     JOIN orders o ON p.orderId = o.orderId 
     WHERE p.paymentId = ?`,
    [paymentId]
  );
  return rows[0];
};

// Update payment status (approve/reject)
exports.updateStatus = async (paymentId, status, adminId, connection = pool) => {
  const [result] = await connection.query(
    `UPDATE payments 
     SET paymentStatus = ?, verifiedByAdminId = ?, paymentVerifiedAt = CURRENT_TIMESTAMP 
     WHERE paymentId = ?`,
    [status, adminId, paymentId]
  );
  return result.affectedRows > 0;
};
