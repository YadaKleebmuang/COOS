const { pool } = require("../config/db");

// ดึง gallery images ทั้งหมด (เฉพาะที่ active) พร้อม workTypeName
exports.findAll = async (filters = {}) => {
  let query = `
    SELECT
      gi.imageId,
      gi.imageUrl,
      gi.workTypeId,
      wt.workTypeName,
      gi.imageTitle,
      gi.imageDescription,
      gi.imageTags,
      gi.imageIsActive,
      gi.imageCreatedAt,
      gi.imageUpdatedAt
    FROM galleryImages gi
    JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
    WHERE 1=1
  `;
  const params = [];

  // Filter: เฉพาะ active
  if (filters.activeOnly !== false) {
    query += ` AND gi.imageIsActive = 1`;
  }

  // Filter: ตาม workTypeId
  if (filters.workTypeId) {
    query += ` AND gi.workTypeId = ?`;
    params.push(filters.workTypeId);
  }

  // Filter: ตาม tag (LIKE search)
  if (filters.tag) {
    query += ` AND gi.imageTags LIKE ?`;
    params.push(`%${filters.tag}%`);
  }

  query += ` ORDER BY gi.imageCreatedAt DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

// ดึง gallery image ตาม id
exports.findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      gi.imageId,
      gi.imageUrl,
      gi.workTypeId,
      wt.workTypeName,
      gi.imageTitle,
      gi.imageDescription,
      gi.imageTags,
      gi.imageIsActive,
      gi.imageCreatedAt,
      gi.imageUpdatedAt
    FROM galleryImages gi
    JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
    WHERE gi.imageId = ?`,
    [id]
  );
  return rows[0];
};

// สร้าง gallery image ใหม่
exports.create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO galleryImages (
      imageUrl, workTypeId, imageTitle, imageDescription, imageTags
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      data.imageUrl,
      data.workTypeId,
      data.imageTitle || null,
      data.imageDescription || null,
      data.imageTags || null,
    ]
  );
  return result.insertId;
};

// อัปเดต gallery image
exports.update = async (id, data) => {
  const [rows] = await pool.query(
    "SELECT imageId FROM galleryImages WHERE imageId = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const [result] = await pool.query(
    `UPDATE galleryImages SET
      imageUrl = ?,
      workTypeId = ?,
      imageTitle = ?,
      imageDescription = ?,
      imageTags = ?,
      imageIsActive = ?
    WHERE imageId = ?`,
    [
      data.imageUrl,
      data.workTypeId,
      data.imageTitle || null,
      data.imageDescription || null,
      data.imageTags || null,
      data.imageIsActive !== undefined ? data.imageIsActive : 1,
      id,
    ]
  );

  return result.affectedRows;
};

// ลบ gallery image
exports.remove = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM galleryImages WHERE imageId = ?",
    [id]
  );
  return result.affectedRows;
};

// Toggle active/inactive
exports.toggleActive = async (id) => {
  const [rows] = await pool.query(
    "SELECT imageIsActive FROM galleryImages WHERE imageId = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const newStatus = rows[0].imageIsActive === 1 ? 0 : 1;
  const [result] = await pool.query(
    "UPDATE galleryImages SET imageIsActive = ? WHERE imageId = ?",
    [newStatus, id]
  );

  return { affectedRows: result.affectedRows, imageIsActive: newStatus };
};
