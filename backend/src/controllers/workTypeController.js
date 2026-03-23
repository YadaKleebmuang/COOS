const WorkTypeModel = require("../models/workTypeModel");

// GET /api/v1/work-types
exports.getAll = async (req, res) => {
  try {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    const [rows] = await WorkTypeModel.findAll(includeInactive);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทงาน" });
    }

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/work-types
exports.create = async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/v1/work-types/:id
exports.update = async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/v1/work-types/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await WorkTypeModel.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทงานนี้" });
    }

    res.status(200).json({ message: "ลบประเภทงานสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
