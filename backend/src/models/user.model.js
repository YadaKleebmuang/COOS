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
