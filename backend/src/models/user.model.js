const { pool } = require("../config/db");

// get all users
exports.findAll = async () => {
  const [rows] = await pool.query(
    `SELECT
      userId,
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole,
      userCreatedAt
    FROM users`
  );
  return rows;
};

// get user by id
exports.findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      userId,
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole,
      userCreatedAt
    FROM users WHERE userId = ?`,
    [id]
  );
  return rows[0];
};

// get user by email
exports.findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT
      userId,
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole,
      userCreatedAt
    FROM users WHERE userEmail = ?`,
    [email]
  );
  return rows[0];
};

// create user
exports.create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO users (
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userFirstName,
      data.userLastName,
      data.userEmail,
      data.userPassword,
      data.userPhone,
      data.userAddress,
      data.userRole || "customer",
    ]
  );
  return result.insertId;
};

// delete user
exports.remove = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE userId = ?", [id]);
  return result.affectedRows;
};

// update user
exports.update = async (id, data) => {
  //เช็คว่ามี user นี้ไหม
  const [rows] = await pool.query("SELECT userId FROM users WHERE userId = ?", [
    id,
  ]);

  if (rows.length === 0) {
    return null; // ไม่พบ user
  }

  const [result] = await pool.query(
    `UPDATE users SET
      userFirstName = ?,
      userLastName = ?,
      userEmail = ?,
      userPhone = ?,
      userAddress = ?,
      userRole = ?
    WHERE userId = ?`,
    [
      data.userFirstName,
      data.userLastName,
      data.userEmail,
      data.userPhone,
      data.userAddress,
      data.userRole,
      id,
    ]
  );

  return result.affectedRows;
};

// บันทึก reset token + วันหมดอายุ
exports.saveResetToken = async (email, token, expiry) => {
  const [result] = await pool.query(
    `UPDATE users SET userResetToken = ?, userResetTokenExpiry = ? WHERE userEmail = ?`,
    [token, expiry, email]
  );
  return result.affectedRows;
};

// ค้นหา user จาก reset token ที่ยังไม่หมดอายุ
exports.findByResetToken = async (token) => {
  const [rows] = await pool.query(
    `SELECT userId, userEmail, userFirstName, userLastName
     FROM users
     WHERE userResetToken = ? AND userResetTokenExpiry > NOW()`,
    [token]
  );
  return rows[0];
};

// รีเซ็ตรหัสผ่าน + ลบ token
exports.resetPassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    `UPDATE users SET userPassword = ?, userResetToken = NULL, userResetTokenExpiry = NULL WHERE userId = ?`,
    [hashedPassword, userId]
  );
  return result.affectedRows;
};
