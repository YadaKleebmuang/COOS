const PackageModel = require("../models/packageModel");

const VALID_RESOLUTIONS = ["FullHD", "4K"];

// GET /api/v1/packages
exports.getAll = async (req, res, next) => {
  try {
    const includeInactive =
      req.query.all === "true" && req.session?.userRole === "admin";
    const [rows] = await PackageModel.findAll(includeInactive);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจ" });
    }

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/packages/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await PackageModel.findById(req.params.id);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจนี้" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/packages
exports.create = async (req, res, next) => {
  try {
    const {
      packageName,
      packageImageCount,
      packageResolution,
      packageDeliveryDays,
      packagePrice,
      packageGalleryDiscount,
    } = req.body;

    if (packageGalleryDiscount !== undefined && (Number(packageGalleryDiscount) < 0 || Number(packageGalleryDiscount) > 100)) {
      return res.status(400).json({ message: "packageGalleryDiscount ต้องอยู่ระหว่าง 0 ถึง 100" });
    }

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
    next(err);
  }
};

// PATCH /api/v1/packages/:id
exports.update = async (req, res, next) => {
  try {
    const { packageResolution, packageGalleryDiscount } = req.body;

    if (packageGalleryDiscount !== undefined && (Number(packageGalleryDiscount) < 0 || Number(packageGalleryDiscount) > 100)) {
      return res.status(400).json({ message: "packageGalleryDiscount ต้องอยู่ระหว่าง 0 ถึง 100" });
    }

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
    next(err);
  }
};

// DELETE /api/v1/packages/:id
exports.delete = async (req, res, next) => {
  try {
    const [result] = await PackageModel.delete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบแพ็กเกจนี้" });
    }

    res.status(200).json({ message: "ลบแพ็กเกจสำเร็จ" });
  } catch (err) {
    next(err);
  }
};
