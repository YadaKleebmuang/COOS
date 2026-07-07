const { pool } = require("../config/db");

exports.findAll = async () => {
  const [rows] = await pool.query("SELECT * FROM tags ORDER BY createdAt DESC");
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM tags WHERE tagId = ?", [id]);
  return rows[0];
};

exports.create = async (tagName) => {
  const [result] = await pool.query("INSERT INTO tags (tagName) VALUES (?)", [tagName]);
  return result;
};

exports.update = async (id, tagName) => {
  const [result] = await pool.query("UPDATE tags SET tagName = ? WHERE tagId = ?", [tagName, id]);
  return result;
};

exports.delete = async (id) => {
  const [result] = await pool.query("DELETE FROM tags WHERE tagId = ?", [id]);
  return result;
};
