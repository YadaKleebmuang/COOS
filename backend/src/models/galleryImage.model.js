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
      GROUP_CONCAT(t.tagName SEPARATOR ',') AS imageTags,
      gi.imageIsActive,
      gi.imageCreatedAt,
      gi.imageUpdatedAt
    FROM galleryImages gi
    JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
    LEFT JOIN galleryImageTags git ON gi.imageId = git.imageId
    LEFT JOIN tags t ON git.tagId = t.tagId
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

  // Filter: ตาม tag (Exact match)
  if (filters.tag) {
    query += ` AND gi.imageId IN (
      SELECT git2.imageId 
      FROM galleryImageTags git2 
      JOIN tags t2 ON git2.tagId = t2.tagId 
      WHERE t2.tagName = ?
    )`;
    params.push(filters.tag.trim());
  }

  query += ` GROUP BY gi.imageId ORDER BY gi.imageCreatedAt DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

// ดึง gallery image ตาม id
exports.findById = async (id, { activeOnly = true } = {}) => {
  const activeClause = activeOnly ? " AND gi.imageIsActive = 1" : "";
  const [rows] = await pool.query(
    `SELECT
      gi.imageId,
      gi.imageUrl,
      gi.workTypeId,
      wt.workTypeName,
      gi.imageTitle,
      gi.imageDescription,
      GROUP_CONCAT(t.tagName SEPARATOR ',') AS imageTags,
      gi.imageIsActive,
      gi.imageCreatedAt,
      gi.imageUpdatedAt
    FROM galleryImages gi
    JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
    LEFT JOIN galleryImageTags git ON gi.imageId = git.imageId
    LEFT JOIN tags t ON git.tagId = t.tagId
    WHERE gi.imageId = ?${activeClause}
    GROUP BY gi.imageId`,
    [id]
  );
  return rows[0];
};

// สร้าง gallery image ใหม่
exports.create = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO galleryImages (
        imageUrl, workTypeId, imageTitle, imageDescription
      ) VALUES (?, ?, ?, ?)`,
      [
        data.imageUrl,
        data.workTypeId,
        data.imageTitle || null,
        data.imageDescription || null,
      ]
    );

    const imageId = result.insertId;

    if (data.imageTags) {
      const tags = data.imageTags.split(",").map(t => t.trim().replace(/^#/, '')).filter(t => t);
      for (const tag of tags) {
        // Insert tag if not exists
        await connection.query("INSERT IGNORE INTO tags (tagName) VALUES (?)", [tag]);
        // Get tagId
        const [tagRows] = await connection.query("SELECT tagId FROM tags WHERE tagName = ?", [tag]);
        if (tagRows.length > 0) {
          const tagId = tagRows[0].tagId;
          await connection.query("INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)", [imageId, tagId]);
        }
      }
    }

    await connection.commit();
    return imageId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// อัปเดต gallery image
exports.update = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT imageId FROM galleryImages WHERE imageId = ?",
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return null;
    }

    const [result] = await connection.query(
      `UPDATE galleryImages SET
        imageUrl = ?,
        workTypeId = ?,
        imageTitle = ?,
        imageDescription = ?,
        imageIsActive = ?
      WHERE imageId = ?`,
      [
        data.imageUrl,
        data.workTypeId,
        data.imageTitle || null,
        data.imageDescription || null,
        data.imageIsActive !== undefined ? data.imageIsActive : 1,
        id,
      ]
    );

    if (data.imageTags !== undefined) {
      // Clear old tags
      await connection.query("DELETE FROM galleryImageTags WHERE imageId = ?", [id]);

      if (data.imageTags) {
        const tags = data.imageTags.split(",").map(t => t.trim().replace(/^#/, '')).filter(t => t);
        for (const tag of tags) {
          await connection.query("INSERT IGNORE INTO tags (tagName) VALUES (?)", [tag]);
          const [tagRows] = await connection.query("SELECT tagId FROM tags WHERE tagName = ?", [tag]);
          if (tagRows.length > 0) {
            const tagId = tagRows[0].tagId;
            await connection.query("INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)", [id, tagId]);
          }
        }
      }
    }

    await connection.commit();
    return result.affectedRows;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
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
