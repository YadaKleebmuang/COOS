const { pool } = require("../config/db");

exports.getAllFiles = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    let sql = `
      SELECT * FROM (
        -- Order Images (Source, AI Generated, Selected Final)
        SELECT 
          CONCAT('img_', oi.orderImageId) AS fileId,
          SUBSTRING_INDEX(oi.imageUrl, '/', -1) AS fileName,
          'image' AS fileType,
          oi.orderId,
          CONCAT(u.userFirstName, ' ', u.userLastName) AS ownerName,
          0 AS fileSize,
          oi.imageCreatedAt AS uploadedAt,
          oi.imageUrl AS fileUrl,
          'active' AS status
        FROM orderImages oi
        JOIN orders o ON oi.orderId = o.orderId
        LEFT JOIN users u ON 
          (CASE 
            WHEN oi.imageType = 'source' THEN o.customerId 
            ELSE o.editorId 
          END) = u.userId

        UNION ALL

        -- Payment Slips
        SELECT 
          CONCAT('pay_', p.paymentId) AS fileId,
          SUBSTRING_INDEX(p.paymentSlipUrl, '/', -1) AS fileName,
          'image' AS fileType,
          p.orderId,
          CONCAT(u.userFirstName, ' ', u.userLastName) AS ownerName,
          0 AS fileSize,
          p.paymentCreatedAt AS uploadedAt,
          p.paymentSlipUrl AS fileUrl,
          'active' AS status
        FROM payments p
        JOIN orders o ON p.orderId = o.orderId
        JOIN users u ON o.customerId = u.userId
      ) AS allFiles
      WHERE 1=1
    `;

    const params = [];

    if (type && type !== 'all') {
      sql += " AND fileType = ?";
      params.push(type);
    }

    if (status && status !== 'all') {
      sql += " AND status = ?";
      params.push(status);
    }

    if (search) {
      sql += " AND (LOWER(fileName) LIKE ? OR LOWER(ownerName) LIKE ?)";
      const searchParam = `%${search.toLowerCase()}%`;
      params.push(searchParam, searchParam);
    }

    sql += " ORDER BY uploadedAt DESC";

    const [files] = await pool.query(sql, params);

    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
