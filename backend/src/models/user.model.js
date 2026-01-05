const { pool } = require('../config/db');

// get all users
exports.findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, status, created_at FROM users'
  );
  return rows;
};

// get user by id
exports.findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, status FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

// create user
exports.create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [data.name, data.email, data.password]
  );
  return result.insertId;
};

// delete user
exports.remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};
