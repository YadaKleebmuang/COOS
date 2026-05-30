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
exports.findAll = async ({ customerId, editorId, status }) => {
  let sql = `
    SELECT o.*, 
           u.userFirstName AS customerFirstName, u.userLastName AS customerLastName,
           e.userFirstName AS editorFirstName, e.userLastName AS editorLastName,
           p.packageName, wt.workTypeName
    FROM orders o
    JOIN users u ON o.customerId = u.userId
    LEFT JOIN users e ON o.editorId = e.userId
    JOIN packages p ON o.packageId = p.packageId
    JOIN workTypes wt ON o.workTypeId = wt.workTypeId
    WHERE 1=1
  `;
  const params = [];

  if (customerId) {
    sql += " AND o.customerId = ?";
    params.push(customerId);
  }

  if (editorId) {
    sql += " AND o.editorId = ?";
    params.push(editorId);
  }

  if (status) {
    sql += " AND o.orderStatus = ?";
    params.push(status);
  }

  sql += " ORDER BY o.orderCreatedAt DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
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
    let nextStatus = currentStatus;

    if (paymentStatus === "approved") {
      if (payment.paymentType === "deposit" && currentStatus === "waiting_deposit") {
        nextStatus = order.editorId ? "waiting_to_start" : "waiting_assignment";
      } else if (payment.paymentType === "final" && currentStatus === "waiting_final_payment") {
        nextStatus = "completed";
      }

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
