const { pool } = require("../config/db");

// Get all settings
exports.getAllSettings = async () => {
  const [rows] = await pool.query(`SELECT settingKey, settingValue FROM systemSettings`);
  const settings = {};
  rows.forEach((row) => {
    // Attempt to parse boolean/numbers if possible, or leave as string
    let val = row.settingValue;
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (!isNaN(val) && val !== "") val = Number(val);
    settings[row.settingKey] = val;
  });
  return settings;
};

// Update multiple settings
exports.updateSettings = async (updates, adminId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const keys = Object.keys(updates);
    for (const key of keys) {
      let val = updates[key];
      if (typeof val === "boolean") val = val ? "true" : "false";
      else val = String(val);

      await connection.query(
        `INSERT INTO systemSettings (settingKey, settingValue, updatedByAdminId) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE settingValue = ?, updatedByAdminId = ?`,
        [key, val, adminId, val, adminId]
      );
    }

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
