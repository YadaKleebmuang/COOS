const { pool } = require("../config/db");

exports.findAll = async (includeInactive = false) => {
  const sql = includeInactive
    ? "SELECT * FROM workTypes ORDER BY workTypeId ASC"
    : "SELECT * FROM workTypes WHERE workTypeIsActive = 1 ORDER BY workTypeId ASC";
  return pool.query(sql);
};

exports.findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM workTypes WHERE workTypeId = ?",
    [id],
  );
  return rows[0];
};

exports.findByName = async (name) => {
  const [rows] = await pool.query(
    "SELECT * FROM workTypes WHERE workTypeName = ?",
    [name],
  );
  return rows[0];
};

exports.create = async (workTypeName, workTypeDescription) => {
  const [result] = await pool.query(
    "INSERT INTO workTypes (workTypeName, workTypeDescription) VALUES (?, ?)",
    [workTypeName, workTypeDescription || null],
  );
  return [result];
};

exports.update = async (id, fields) => {
  const sql = `
    UPDATE workTypes
    SET
      workTypeName = COALESCE(?, workTypeName),
      workTypeDescription = COALESCE(?, workTypeDescription),
      workTypeIsActive = COALESCE(?, workTypeIsActive)
    WHERE workTypeId = ?
  `;
  const [result] = await pool.query(sql, [
    fields.workTypeName || null,
    fields.workTypeDescription || null,
    fields.workTypeIsActive ?? null,
    id,
  ]);
  return [result];
};

exports.delete = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM workTypes WHERE workTypeId = ?",
    [id],
  );
  return [result];
};

