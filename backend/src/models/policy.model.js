const { pool } = require("../config/db");

// ดึง policies ทั้งหมด (เฉพาะที่ active)
exports.findAll = async (filters = {}) => {
  let query = `
    SELECT
      policyId,
      policyTitle,
      policyContent,
      policyType,
      policyIsActive,
      policyCreatedAt,
      policyUpdatedAt
    FROM policies
    WHERE 1=1
  `;
  const params = [];

  // Filter: เฉพาะ active
  if (filters.activeOnly !== false) {
    query += ` AND policyIsActive = 1`;
  }

  // Filter: ตาม policyType
  if (filters.policyType) {
    query += ` AND policyType = ?`;
    params.push(filters.policyType);
  }

  query += ` ORDER BY policyCreatedAt DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

// ดึง policy ตาม id
exports.findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      policyId,
      policyTitle,
      policyContent,
      policyType,
      policyIsActive,
      policyCreatedAt,
      policyUpdatedAt
    FROM policies
    WHERE policyId = ?`,
    [id]
  );
  return rows[0];
};

// ดึง policy ตาม type (สำหรับ public)
exports.findByType = async (type) => {
  const [rows] = await pool.query(
    `SELECT
      policyId,
      policyTitle,
      policyContent,
      policyType,
      policyCreatedAt,
      policyUpdatedAt
    FROM policies
    WHERE policyType = ? AND policyIsActive = 1
    ORDER BY policyCreatedAt DESC
    LIMIT 1`,
    [type]
  );
  return rows[0];
};

// สร้าง policy ใหม่
exports.create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO policies (
      policyTitle, policyContent, policyType
    ) VALUES (?, ?, ?)`,
    [data.policyTitle, data.policyContent, data.policyType]
  );
  return result.insertId;
};

// อัปเดต policy
exports.update = async (id, data) => {
  const [rows] = await pool.query(
    "SELECT policyId FROM policies WHERE policyId = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const [result] = await pool.query(
    `UPDATE policies SET
      policyTitle = ?,
      policyContent = ?,
      policyType = ?,
      policyIsActive = ?
    WHERE policyId = ?`,
    [
      data.policyTitle,
      data.policyContent,
      data.policyType,
      data.policyIsActive !== undefined ? data.policyIsActive : 1,
      id,
    ]
  );

  return result.affectedRows;
};

// ลบ policy
exports.remove = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM policies WHERE policyId = ?",
    [id]
  );
  return result.affectedRows;
};
