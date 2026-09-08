const { pool } = require("../config/db");

// 1. Create order and insert optional source images inside a transaction
exports.create = async (orderData, sourceImageUrls = []) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customerId,
      packageId,
      workTypeId,
      orderStyle,
      orderColorTone,
      orderComposition,
      orderNote,
      orderRequiredDate,
      orderIsUrgent,
      orderIsGalleryAllowed,
      orderBasePrice,
      orderUrgentPrice,
      orderDiscount,
      orderTotalPrice,
    } = orderData;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        customerId, packageId, workTypeId, orderStyle, orderColorTone,
        orderComposition, orderNote, orderRequiredDate, orderIsUrgent,
        orderIsGalleryAllowed, orderBasePrice, orderUrgentPrice, orderDiscount,
        orderTotalPrice, orderStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting_deposit')`,
      [
        customerId,
        packageId,
        workTypeId,
        orderStyle || null,
        orderColorTone || null,
        orderComposition || null,
        orderNote || null,
        orderRequiredDate,
        orderIsUrgent ? 1 : 0,
        orderIsGalleryAllowed ? 1 : 0,
        orderBasePrice,
        orderUrgentPrice,
        orderDiscount,
        orderTotalPrice,
      ]
    );

    const orderId = orderResult.insertId;

    // If there are source images, insert them
    if (sourceImageUrls && sourceImageUrls.length > 0) {
      for (const url of sourceImageUrls) {
        await connection.query(
          `INSERT INTO orderImages (orderId, imageType, imageUrl)
           VALUES (?, 'source', ?)`,
          [orderId, url]
        );
      }
    }

    // Insert initial workflow log
    await connection.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, 'none', 'waiting_deposit', ?, 'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ')`,
      [orderId, customerId]
    );

    await connection.commit();
    return orderId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 2. Find all orders with filters
exports.findAll = async ({ customerId, editorId, status, page = 1, limit = 10 }) => {
  let baseQuery = `
    FROM orders o
    JOIN users u ON o.customerId = u.userId
    LEFT JOIN users e ON o.editorId = e.userId
    JOIN packages p ON o.packageId = p.packageId
    JOIN workTypes wt ON o.workTypeId = wt.workTypeId
    WHERE 1=1
  `;
  const params = [];

  if (customerId) {
    baseQuery += " AND o.customerId = ?";
    params.push(customerId);
  }

  if (editorId) {
    baseQuery += " AND o.editorId = ?";
    params.push(editorId);
  }

  if (status) {
    baseQuery += " AND o.orderStatus = ?";
    params.push(status);
  }

  // Count total records
  const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
  const [[countResult]] = await pool.query(countSql, params);
  const total = countResult.total;

  // Fetch paginated data
  const offset = (page - 1) * limit;
  const sql = `
    SELECT o.*,
           u.userFirstName AS customerFirstName, u.userLastName AS customerLastName,
           e.userFirstName AS editorFirstName, e.userLastName AS editorLastName,
           p.packageName, wt.workTypeName
    ${baseQuery}
    ORDER BY o.orderCreatedAt DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(sql, [...params, limit, offset]);

  return {
    data: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// 3. Find single order details
exports.findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT o.*,
            u.userFirstName AS customerFirstName, u.userLastName AS customerLastName, u.userEmail AS customerEmail, u.userPhone AS customerPhone,
            e.userFirstName AS editorFirstName, e.userLastName AS editorLastName,
            p.packageName, p.packageResolution, p.packageImageCount, wt.workTypeName
     FROM orders o
     JOIN users u ON o.customerId = u.userId
     LEFT JOIN users e ON o.editorId = e.userId
     JOIN packages p ON o.packageId = p.packageId
     JOIN workTypes wt ON o.workTypeId = wt.workTypeId
     WHERE o.orderId = ?`,
    [id]
  );
  return rows[0];
};

// 4. Fetch order images
exports.findImages = async (orderId) => {
  const [rows] = await pool.query(
    "SELECT * FROM orderImages WHERE orderId = ? ORDER BY imageCreatedAt ASC",
    [orderId]
  );
  return rows;
};

// Fetch AI-generated draft metadata owned by one Editor
exports.findPromptNotesByEditor = async (editorId) => {
  const [rows] = await pool.query(
    `SELECT
       oi.orderImageId,
       oi.orderId,
       oi.imageUrl,
       oi.imageThumbnailUrl,
       oi.aiEngine,
       oi.positivePrompt,
       oi.negativePrompt,
       oi.cfgScale,
       oi.steps,
       oi.seed,
       oi.imageCreatedAt
     FROM orderImages oi
     JOIN orders o ON o.orderId = oi.orderId
     WHERE o.editorId = ?
       AND oi.imageType = 'ai_generated'
     ORDER BY oi.imageCreatedAt DESC, oi.orderImageId DESC`,
    [editorId]
  );
  return rows;
};

// 5. Fetch order payments
exports.findPayments = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.userFirstName AS verifiedByFirstName, u.userLastName AS verifiedByLastName
     FROM payments p
     LEFT JOIN users u ON p.verifiedByAdminId = u.userId
     WHERE p.orderId = ? ORDER BY p.paymentCreatedAt ASC`,
    [orderId]
  );
  return rows;
};

// 6. Fetch workflow logs
exports.findLogs = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT wl.*, u.userFirstName, u.userLastName, u.userRole
     FROM workflowLogs wl
     LEFT JOIN users u ON wl.changedById = u.userId
     WHERE wl.orderId = ? ORDER BY wl.changedAt ASC`,
    [orderId]
  );
  return rows;
};

// 7. Update status with workflow log inside a transaction
exports.updateStatus = async (orderId, fromStatus, toStatus, changedById, logNote) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "UPDATE orders SET orderStatus = ? WHERE orderId = ?",
      [toStatus, orderId]
    );

    await connection.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, fromStatus, toStatus, changedById, logNote || null]
    );

    if (toStatus === 'completed' && fromStatus !== 'completed') {
      await _autoPublishToGallery(connection, orderId);
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

// 8. Assign Editor to order
exports.assignEditor = async (orderId, editorId, changedById) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check current status
    const [orders] = await connection.query(
      "SELECT orderStatus, editorId FROM orders WHERE orderId = ?",
      [orderId]
    );
    if (orders.length === 0) throw new Error("Order not found");
    const currentOrder = orders[0];

    await connection.query(
      "UPDATE orders SET editorId = ? WHERE orderId = ?",
      [editorId, orderId]
    );

    let nextStatus = currentOrder.orderStatus;
    // Auto transition from 'waiting_assignment' to 'waiting_to_start' when assigned
    if (currentOrder.orderStatus === "waiting_assignment" && editorId !== null) {
      nextStatus = "waiting_to_start";
      await connection.query(
        "UPDATE orders SET orderStatus = ? WHERE orderId = ?",
        [nextStatus, orderId]
      );
    }

    const editorLogNote = editorId
      ? `มอบหมายงานให้ Editor ID: ${editorId}`
      : "ยกเลิกการมอบหมายงาน";

    await connection.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, currentOrder.orderStatus, nextStatus, changedById, editorLogNote]
    );

    await connection.commit();
    return nextStatus;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 9. Add Order Image (including AI Prompt if type is ai_generated)
exports.addOrderImage = async (orderId, imageData) => {
  const {
    imageType,
    imageUrl,
    imageThumbnailUrl,
    aiEngine,
    positivePrompt,
    negativePrompt,
    cfgScale,
    steps,
    seed,
  } = imageData;

  const [result] = await pool.query(
    `INSERT INTO orderImages (
      orderId, imageType, imageUrl, imageThumbnailUrl,
      aiEngine, positivePrompt, negativePrompt, cfgScale, steps, seed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      imageType,
      imageUrl,
      imageThumbnailUrl || null,
      aiEngine || null,
      positivePrompt || null,
      negativePrompt || null,
      cfgScale || null,
      steps || null,
      seed || null,
    ]
  );
  return result.insertId;
};

// 9.5 Find Image By ID
exports.findImageById = async (imageId) => {
  const [rows] = await pool.query(
    "SELECT * FROM orderImages WHERE orderImageId = ?",
    [imageId]
  );
  return rows[0];
};

// 9.6 Update Order Image (Draft / Generated)
exports.updateOrderImage = async (imageId, updateData) => {
  const {
    imageUrl,
    imageThumbnailUrl,
    aiEngine,
    positivePrompt,
    negativePrompt,
    cfgScale,
    steps,
    seed
  } = updateData;

  const updates = [];
  const params = [];

  if (imageUrl !== undefined) {
    updates.push("imageUrl = ?");
    params.push(imageUrl);
  }
  if (imageThumbnailUrl !== undefined) {
    updates.push("imageThumbnailUrl = ?");
    params.push(imageThumbnailUrl);
  }
  if (aiEngine !== undefined) {
    updates.push("aiEngine = ?");
    params.push(aiEngine);
  }
  if (positivePrompt !== undefined) {
    updates.push("positivePrompt = ?");
    params.push(positivePrompt);
  }
  if (negativePrompt !== undefined) {
    updates.push("negativePrompt = ?");
    params.push(negativePrompt);
  }
  if (cfgScale !== undefined) {
    updates.push("cfgScale = ?");
    params.push(cfgScale);
  }
  if (steps !== undefined) {
    updates.push("steps = ?");
    params.push(steps);
  }
  if (seed !== undefined) {
    updates.push("seed = ?");
    params.push(seed);
  }

  if (updates.length === 0) return true;

  params.push(imageId);

  const [result] = await pool.query(
    `UPDATE orderImages SET ${updates.join(", ")} WHERE orderImageId = ?`,
    params
  );

  return result.affectedRows > 0;
};

// 10. Add Payment Slip
exports.addPayment = async (paymentData) => {
  const { orderId, paymentType, paymentAmount, paymentSlipUrl } = paymentData;
  const [result] = await pool.query(
    `INSERT INTO payments (orderId, paymentType, paymentAmount, paymentSlipUrl, paymentStatus)
     VALUES (?, ?, ?, ?, 'pending')`,
    [orderId, paymentType, paymentAmount, paymentSlipUrl]
  );
  return result.insertId;
};

// 11. Find Payment By ID
exports.findPaymentById = async (paymentId) => {
  const [rows] = await pool.query(
    "SELECT * FROM payments WHERE paymentId = ?",
    [paymentId]
  );
  return rows[0];
};

const getNextStatusAfterPayment = (paymentStatus, paymentType, currentStatus, editorId) => {
  if (paymentStatus !== "approved") return currentStatus;
  if (paymentType === "deposit" && currentStatus === "waiting_deposit") {
    return editorId ? "waiting_to_start" : "waiting_assignment";
  }
  if (paymentType === "final" && currentStatus === "waiting_final_payment") {
    return "delivered";
  }
  return currentStatus;
};

exports.getNextStatusAfterPayment = getNextStatusAfterPayment;

// 12. Verify Payment (Approve / Reject)
exports.verifyPayment = async (paymentId, paymentStatus, verifiedByAdminId, logNote) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update Payment Status
    await connection.query(
      `UPDATE payments
       SET paymentStatus = ?, paymentVerifiedAt = CURRENT_TIMESTAMP, verifiedByAdminId = ?
       WHERE paymentId = ?`,
      [paymentStatus, verifiedByAdminId, paymentId]
    );

    // 2. Fetch Payment details to find Order ID
    const [payments] = await connection.query(
      "SELECT orderId, paymentType, paymentAmount FROM payments WHERE paymentId = ?",
      [paymentId]
    );
    if (payments.length === 0) throw new Error("Payment not found");
    const payment = payments[0];
    const orderId = payment.orderId;

    // 3. Fetch Order details
    const [orders] = await connection.query(
      "SELECT orderStatus, editorId FROM orders WHERE orderId = ?",
      [orderId]
    );
    if (orders.length === 0) throw new Error("Order not found");
    const order = orders[0];
    const currentStatus = order.orderStatus;
    const nextStatus = getNextStatusAfterPayment(
      paymentStatus,
      payment.paymentType,
      currentStatus,
      order.editorId
    );

    if (paymentStatus === "approved") {
      if (nextStatus !== currentStatus) {
        await connection.query(
          "UPDATE orders SET orderStatus = ? WHERE orderId = ?",
          [nextStatus, orderId]
        );
      }
    }

    // 4. Log the state change
    const fullLogNote = `ยืนยันการชำระเงิน (${payment.paymentType === 'deposit' ? 'เงินมัดจำ' : 'เงินส่วนที่เหลือ'}): ${paymentStatus === 'approved' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธ/ไม่ผ่าน'} - ${logNote || ''}`;
    await connection.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, currentStatus, nextStatus, verifiedByAdminId, fullLogNote]
    );

    await connection.commit();
    return { orderId, nextStatus };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 13. Select Final Images (Customer selects images)
exports.selectFinalImages = async (orderId, selectedImageIds, customerId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update orderImages
    if (selectedImageIds && selectedImageIds.length > 0) {
      // Create placeholders e.g., "?, ?, ?"
      const placeholders = selectedImageIds.map(() => '?').join(',');
      await connection.query(
        `UPDATE orderImages
         SET imageType = 'selected_final'
         WHERE orderId = ? AND orderImageId IN (${placeholders})`,
        [orderId, ...selectedImageIds]
      );
    }

    // 2. Update order status to waiting_final_payment
    const nextStatus = "waiting_final_payment";
    await connection.query(
      "UPDATE orders SET orderStatus = ? WHERE orderId = ?",
      [nextStatus, orderId]
    );

    // 3. Log the state change
    const logNote = `ลูกค้าทำการเลือกรูปภาพผลงานจำนวน ${selectedImageIds.length} ภาพ เรียบร้อยแล้ว`;
    await connection.query(
      `INSERT INTO workflowLogs (orderId, fromStatus, toStatus, changedById, logNote)
       VALUES (?, 'waiting_selection', ?, ?, ?)`,
      [orderId, nextStatus, customerId, logNote]
    );

    await connection.commit();
    return nextStatus;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// Helper: Auto publish to gallery when completed
const _autoPublishToGallery = async (connection, orderId) => {
  // 1. Fetch order details to check if it's allowed
  const [orders] = await connection.query(
    "SELECT workTypeId, orderIsGalleryAllowed FROM orders WHERE orderId = ?",
    [orderId]
  );
  if (!orders.length || orders[0].orderIsGalleryAllowed !== 1) return;

  const orderWorkTypeId = orders[0].workTypeId;

  // 2. Fetch all selected_final images
  const [images] = await connection.query(
    "SELECT orderImageId, imageUrl FROM orderImages WHERE orderId = ? AND imageType = 'selected_final'",
    [orderId]
  );

  if (!images.length) return;

  // 3. Insert into galleryImages with imageIsActive = 0 (Pending Approval)
  for (const img of images) {
    const [existing] = await connection.query(
      "SELECT imageId FROM galleryImages WHERE imageUrl = ?",
      [img.imageUrl]
    );

    let newGalleryImageId = null;
    if (!existing.length) {
      const [result] = await connection.query(
        `INSERT INTO galleryImages (imageUrl, workTypeId, imageTitle, imageApprovalStatus, imageIsActive)
         VALUES (?, ?, ?, 'pending', 0)`,
        [img.imageUrl, orderWorkTypeId, `Order #${orderId} (รออนุมัติ)`]
      );
      newGalleryImageId = result.insertId;
    } else {
      newGalleryImageId = existing[0].imageId;
    }

    // 4. Migrate tags from orderImageTags to galleryImageTags
    if (newGalleryImageId) {
      const [tags] = await connection.query(
        "SELECT tagId FROM orderImageTags WHERE orderImageId = ?",
        [img.orderImageId]
      );
      for (const tag of tags) {
        await connection.query(
          "INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)",
          [newGalleryImageId, tag.tagId]
        );
      }
    }
  }
};

exports.getGalleryMetadata = async (orderImageId) => {
  const [images] = await pool.query(
    "SELECT orderImageId FROM orderImages WHERE orderImageId = ?",
    [orderImageId]
  );
  if (!images.length) return null;

  const [tags] = await pool.query(
    `SELECT t.tagId, t.tagName
     FROM tags t
     JOIN orderImageTags oit ON t.tagId = oit.tagId
     WHERE oit.orderImageId = ?`,
    [orderImageId]
  );

  return {
    tags
  };
};

exports.updateGalleryMetadata = async (orderImageId, tagIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Sync Tags
    await connection.query("DELETE FROM orderImageTags WHERE orderImageId = ?", [orderImageId]);

    if (tagIds && Array.isArray(tagIds)) {
      const uniqueTagIds = [...new Set(tagIds)];

      for (const tagId of uniqueTagIds) {
        // Just verify tagId exists in tags table
        const [existingTag] = await connection.query("SELECT tagId FROM tags WHERE tagId = ?", [tagId]);
        if (existingTag.length > 0) {
          await connection.query(
            "INSERT IGNORE INTO orderImageTags (orderImageId, tagId) VALUES (?, ?)",
            [orderImageId, tagId]
          );
        }
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
