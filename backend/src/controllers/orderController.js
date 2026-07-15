const OrderModel = require("../models/orderModel");
const PackageModel = require("../models/packageModel");
const WorkTypeModel = require("../models/workTypeModel");

// Helper function to check if order status transition is valid
const isValidTransition = (from, to, role) => {
  if (role === "admin") return true; // Admin can change to any state

  const customerTransitions = {
    waiting_deposit: ["cancelled"],
    waiting_selection: ["waiting_final_payment"],
  };

  const editorTransitions = {
    waiting_to_start: ["in_progress"],
    in_progress: ["waiting_selection"],
    delivered: ["completed"],
  };

  if (role === "customer") {
    return customerTransitions[from] && customerTransitions[from].includes(to);
  }

  if (role === "editor") {
    return editorTransitions[from] && editorTransitions[from].includes(to);
  }

  return false;
};

// 1. POST /api/v1/orders (Create Order - Customer only)
exports.create = async (req, res) => {
  try {
    const { userId, userRole } = req.session;

    if (userRole !== "customer") {
      return res.status(403).json({ message: "เฉพาะลูกค้าเท่านั้นที่สามารถสร้างออเดอร์ได้" });
    }

    const {
      packageId,
      workTypeId,
      orderStyle,
      orderColorTone,
      orderComposition,
      orderNote,
      orderRequiredDate,
      orderIsUrgent,
      orderIsGalleryAllowed,
      sourceImageUrls,
    } = req.body;

    // Validate required fields
    if (!packageId || !workTypeId || !orderRequiredDate) {
      return res.status(400).json({ message: "กรุณาระบุ packageId, workTypeId และ orderRequiredDate" });
    }

    // Fetch Package details from DB to calculate prices securely
    const [packages] = await PackageModel.findById(packageId);
    if (!packages || packages.length === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจที่เลือก" });
    }
    const packageItem = packages[0];

    // Check if package is active
    if (!packageItem.packageIsActive) {
      return res.status(400).json({ message: "แพ็กเกจนี้ปิดการใช้งานชั่วคราว" });
    }

    // Dynamic price calculation on backend
    const orderBasePrice = Number(packageItem.packagePrice);
    const orderUrgentPrice = orderIsUrgent ? Number(packageItem.packageUrgentPrice || 0) : 0.00;
    const orderDiscount = orderIsGalleryAllowed 
      ? (orderBasePrice * Number(packageItem.packageGalleryDiscount || 20.00)) / 100 
      : 0.00;
    const orderTotalPrice = orderBasePrice + orderUrgentPrice - orderDiscount;

    const orderId = await OrderModel.create(
      {
        customerId: userId,
        packageId,
        workTypeId,
        orderStyle,
        orderColorTone,
        orderComposition,
        orderNote,
        orderRequiredDate,
        orderIsUrgent: orderIsUrgent ? 1 : 0,
        orderIsGalleryAllowed: orderIsGalleryAllowed ? 1 : 0,
        orderBasePrice,
        orderUrgentPrice,
        orderDiscount,
        orderTotalPrice,
      },
      sourceImageUrls || []
    );

    res.status(201).json({
      message: "สร้างออเดอร์สำเร็จ",
      orderId,
      orderBasePrice,
      orderUrgentPrice,
      orderDiscount,
      orderTotalPrice,
      orderStatus: "waiting_deposit",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. GET /api/v1/orders (List all orders - Role Filtered)
exports.getAll = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const { status } = req.query;

    let customerId = null;
    let editorId = null;

    // Apply role boundaries
    if (userRole === "customer") {
      customerId = userId;
    } else if (userRole === "editor") {
      editorId = userId;
    } else if (userRole === "admin") {
      // Admins can query other users' orders
      if (req.query.customerId) customerId = req.query.customerId;
      if (req.query.editorId) editorId = req.query.editorId;
    }

    const orders = await OrderModel.findAll({ customerId, editorId, status });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. GET /api/v1/orders/:id (Retrieve specific order details)
exports.getById = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const orderId = req.params.id;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }

    // Role-based authorization check
    if (userRole === "customer" && Number(order.customerId) !== Number(userId)) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงข้อมูลออเดอร์นี้" });
    }
    if (userRole === "editor" && Number(order.editorId) !== Number(userId)) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงข้อมูลออเดอร์นี้" });
    }

    // Load related resources
    const images = await OrderModel.findImages(orderId);
    const payments = await OrderModel.findPayments(orderId);
    const workflowLogs = await OrderModel.findLogs(orderId);

    res.status(200).json({
      ...order,
      images,
      payments,
      workflowLogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. PATCH /api/v1/orders/:id/status (Transition order status)
exports.updateStatus = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const orderId = req.params.id;
    const { orderStatus, logNote } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ message: "กรุณาระบุ orderStatus ที่ต้องการเปลี่ยน" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }

    // Validate ownership
    if (userRole === "customer" && Number(order.customerId) !== Number(userId)) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการแก้ไขออเดอร์นี้" });
    }
    if (userRole === "editor" && Number(order.editorId) !== Number(userId)) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการแก้ไขออเดอร์นี้" });
    }

    // Validate workflow state machine transitions
    if (!isValidTransition(order.orderStatus, orderStatus, userRole)) {
      return res.status(400).json({
        message: `ไม่สิทธิ์หรือสถานะไม่ถูกต้องในการเปลี่ยนจาก ${order.orderStatus} ไปเป็น ${orderStatus}`,
      });
    }

    await OrderModel.updateStatus(orderId, order.orderStatus, orderStatus, userId, logNote);
    res.status(200).json({ message: "อัปเดตสถานะออเดอร์สำเร็จ", orderStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. PATCH /api/v1/orders/:id/assign (Assign Editor - Admin only)
exports.assignEditor = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const orderId = req.params.id;
    const { editorId } = req.body; // editorId can be null to unassign

    if (userRole !== "admin") {
      return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถมอบหมายงานได้" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }

    const nextStatus = await OrderModel.assignEditor(orderId, editorId || null, userId);
    res.status(200).json({
      message: editorId ? "มอบหมายงานให้ Editor สำเร็จ" : "ยกเลิกผู้รับผิดชอบสำเร็จ",
      editorId: editorId || null,
      orderStatus: nextStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. POST /api/v1/orders/:id/images (Upload Image for order - Editor/Customer)
exports.uploadImage = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const orderId = req.params.id;
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
    } = req.body;

    if (!imageType || !imageUrl) {
      return res.status(400).json({ message: "กรุณาระบุ imageType และ imageUrl" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }

    // Role restrictions for uploading types
    if (userRole === "customer") {
      if (Number(order.customerId) !== Number(userId)) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงออเดอร์นี้" });
      }
      if (imageType !== "source") {
        return res.status(403).json({ message: "ลูกค้าอัปโหลดได้เฉพาะรูปภาพอ้างอิงต้นฉบับ (source) เท่านั้น" });
      }
    }

    if (userRole === "editor") {
      if (Number(order.editorId) !== Number(userId)) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงออเดอร์นี้" });
      }
      if (imageType === "source") {
        return res.status(403).json({ message: "Editor ไม่สามารถอัปโหลดรูปประเภทต้นฉบับได้" });
      }
    }

    const imageId = await OrderModel.addOrderImage(orderId, {
      imageType,
      imageUrl,
      imageThumbnailUrl,
      aiEngine,
      positivePrompt,
      negativePrompt,
      cfgScale,
      steps,
      seed,
    });

    res.status(201).json({
      message: "อัปโหลดรูปภาพเข้าออเดอร์สำเร็จ",
      imageId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. POST /api/v1/orders/:id/payments (Upload Payment Slip - Customer only)
exports.submitPayment = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const orderId = req.params.id;
    const { paymentType, paymentAmount, paymentSlipUrl } = req.body;

    if (userRole !== "customer") {
      return res.status(403).json({ message: "เฉพาะลูกค้าเท่านั้นที่สามารถส่งหลักฐานชำระเงินได้" });
    }

    if (!paymentType || !paymentAmount || !paymentSlipUrl) {
      return res.status(400).json({ message: "กรุณาระบุ paymentType, paymentAmount และ paymentSlipUrl" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }

    if (Number(order.customerId) !== Number(userId)) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ทำรายการในออเดอร์นี้" });
    }

    // Validate payment amount (BUG-03 Fix)
    const expectedDeposit = Math.round(order.orderTotalPrice * 0.30 * 100) / 100;
    const expectedFinal   = Math.round(order.orderTotalPrice * 0.70 * 100) / 100;
    const expected = paymentType === "deposit" ? expectedDeposit : expectedFinal;
    const submitted = Number(paymentAmount);
    
    if (Math.abs(submitted - expected) > 1) { // tolerance 1 บาท
      return res.status(400).json({ message: `ยอดชำระไม่ถูกต้อง ควรเป็น ${expected} บาท` });
    }

    const paymentId = await OrderModel.addPayment({
      orderId,
      paymentType,
      paymentAmount,
      paymentSlipUrl,
    });

    res.status(201).json({
      message: "ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ",
      paymentId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 8. PATCH /api/v1/orders/:id/payments/:paymentId (Verify Payment Slip - Admin only)
exports.verifyPayment = async (req, res) => {
  try {
    const { userId, userRole } = req.session;
    const paymentId = req.params.paymentId;
    const { paymentStatus, logNote } = req.body; // paymentStatus should be 'approved' or 'rejected'

    if (userRole !== "admin") {
      return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถอนุมัติสลิปเงินโอนได้" });
    }

    if (!["approved", "rejected"].includes(paymentStatus)) {
      return res.status(400).json({ message: "paymentStatus ต้องเป็น approved หรือ rejected เท่านั้น" });
    }

    const payment = await OrderModel.findPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "ไม่พบข้อมูลสลิปชำระเงินนี้" });
    }

    const result = await OrderModel.verifyPayment(paymentId, paymentStatus, userId, logNote);
    res.status(200).json({
      message: "ตรวจสอบสลิปชำระเงินและบันทึกสถานะสำเร็จ",
      paymentStatus,
      nextOrderStatus: result.nextStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
