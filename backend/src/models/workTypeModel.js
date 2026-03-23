const { pool } = require("../config/db");

exports.findAll = async (includeInactive = false) => {
  const sql = includeInactive
    ? "SELECT * FROM worktypes ORDER BY workTypeId ASC"
    : "SELECT * FROM worktypes WHERE workTypeIsActive = 1 ORDER BY workTypeId ASC";
  return pool.query(sql);
};

exports.findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM worktypes WHERE workTypeId = ?",
    [id],
  );
  return rows[0];
};

exports.findByName = async (name) => {
  const [rows] = await pool.query(
    "SELECT * FROM worktypes WHERE workTypeName = ?",
    [name],
  );
  return rows[0];
};

exports.create = async (workTypeName, workTypeDescription) => {
  const [result] = await pool.query(
    "INSERT INTO worktypes (workTypeName, workTypeDescription) VALUES (?, ?)",
    [workTypeName, workTypeDescription || null],
  );
  return [result];
};

exports.update = async (id, fields) => {
  const sql = `
    UPDATE worktypes
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
    "DELETE FROM worktypes WHERE workTypeId = ?",
    [id],
  );
  return [result];
};
