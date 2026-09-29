const WorkTypeModel = require("../models/workTypeModel");

const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

// GET /api/v1/work-types
exports.getAll = async (req, res, next) => {
  try {
    let isAdmin = false;

    // ตรวจสอบ JWT token แบบ optional (เนื่องจาก route นี้เป็น public)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, getJwtSecret());

        if (decoded && decoded.userRole === "admin") {
          isAdmin = true;
        }
      } catch (err) {
        // ปล่อยผ่านถ้า token ไม่ถูกต้อง (ให้ทำงานเหมือน public)
      }
    }

    const includeInactive = req.query.all === "true" && isAdmin;
    const [rows] = await WorkTypeModel.findAll(includeInactive);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทงาน" });
    }

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/work-types
exports.create = async (req, res, next) => {
  try {
    const { workTypeName, workTypeDescription } = req.body;

    if (!workTypeName?.trim()) {
      return res.status(400).json({ message: "workTypeName is required" });
    }

    const [result] = await WorkTypeModel.create(
      workTypeName.trim(),
      workTypeDescription,
    );

    res.status(201).json({
      message: "สร้างประเภทงานสำเร็จ",
      workTypeId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "ชื่อประเภทงานนี้มีอยู่แล้ว" });
    }
    next(err);
  }
};

// PATCH /api/v1/work-types/:id
exports.update = async (req, res, next) => {
  try {
    const [result] = await WorkTypeModel.update(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทงานนี้" });
    }

    res.status(200).json({ message: "อัปเดตประเภทงานสำเร็จ" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "ชื่อประเภทงานนี้มีอยู่แล้ว" });
    }
    next(err);
  }
};

// DELETE /api/v1/work-types/:id
exports.remove = async (req, res, next) => {
  try {
    const [result] = await WorkTypeModel.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทงานนี้" });
    }

    res.status(200).json({ message: "ลบประเภทงานสำเร็จ" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      return res.status(409).json({
        message: "ไม่สามารถลบประเภทงานนี้ได้ เนื่องจากมีคำสั่งซื้อหรือข้อมูลแกลเลอรีที่ใช้งานอยู่"
      });
    }
    next(err);
  }
};
