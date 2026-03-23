const PackageModel = require("../models/packageModel");

const VALID_RESOLUTIONS = ["FullHD", "4K"];

// GET /api/v1/packages
exports.getAll = async (req, res) => {
  try {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    const [rows] = await PackageModel.findAll(includeInactive);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจ" });
    }

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/v1/packages/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await PackageModel.findById(req.params.id);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจนี้" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/packages
exports.create = async (req, res) => {
  try {
    const {
      packageName,
      packageImageCount,
      packageResolution,
      packageDeliveryDays,
      packagePrice,
    } = req.body;

    if (
      !packageName?.trim() ||
      !packageImageCount ||
      !packageResolution ||
      !packageDeliveryDays ||
      packagePrice === undefined
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    if (!VALID_RESOLUTIONS.includes(packageResolution)) {
      return res
        .status(400)
        .json({ message: "packageResolution ต้องเป็น FullHD หรือ 4K" });
    }

    const [result] = await PackageModel.create({
      ...req.body,
      packageName: packageName.trim(),
    });

    res.status(201).json({
      message: "สร้างแพ็กเกจสำเร็จ",
      packageId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/v1/packages/:id
exports.update = async (req, res) => {
  try {
    const { packageResolution } = req.body;

    if (packageResolution && !VALID_RESOLUTIONS.includes(packageResolution)) {
      return res
        .status(400)
        .json({ message: "packageResolution ต้องเป็น FullHD หรือ 4K" });
    }

    const [result] = await PackageModel.update(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจนี้" });
    }

    res.status(200).json({ message: "อัปเดตแพ็กเกจสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/v1/packages/:id
exports.delete = async (req, res) => {
  try {
    const [result] = await PackageModel.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจนี้" });
    }

    res.status(200).json({ message: "ลบแพ็กเกจสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
