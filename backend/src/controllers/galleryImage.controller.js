const GalleryImageModel = require("../models/galleryImage.model");

// GET /gallery-images — ดึงรูปภาพทั้งหมด (รองรับ filter)
exports.getGalleryImages = async (req, res) => {
  try {
    const { workTypeId, tag, all } = req.query;

    const filters = {
      workTypeId: workTypeId || null,
      tag: tag || null,
      activeOnly: all !== "true", // ถ้าส่ง ?all=true จะดึงทั้ง active/inactive
    };

    const images = await GalleryImageModel.findAll(filters);
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /gallery-images/:id — ดึงรูปภาพตาม id
exports.getGalleryImageById = async (req, res) => {
  try {
    const image = await GalleryImageModel.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    res.status(200).json(image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /gallery-images — สร้างรูปภาพใหม่ (รองรับ file upload)
exports.createGalleryImage = async (req, res) => {
  try {
    const { workTypeId, imageTitle, imageDescription, imageTags } = req.body;

    if (!workTypeId) {
      return res.status(400).json({ message: "workTypeId is required" });
    }

    // รับ URL จาก multer file upload หรือจาก body
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl or image file is required" });
    }

    const imageId = await GalleryImageModel.create({
      imageUrl,
      workTypeId,
      imageTitle,
      imageDescription,
      imageTags,
    });

    res.status(201).json({
      message: "Gallery image created",
      imageId,
      imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /gallery-images/:id — อัปเดตรูปภาพ
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    // ถ้ามีไฟล์ใหม่ ใช้ path จาก multer
    if (req.file) {
      req.body.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    const result = await GalleryImageModel.update(id, req.body);

    if (!result) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    res.status(200).json({ message: "Gallery image updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /gallery-images/:id — ลบรูปภาพ
exports.deleteGalleryImage = async (req, res) => {
  try {
    const affected = await GalleryImageModel.remove(req.params.id);

    if (!affected) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    res.json({ message: "Gallery image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /gallery-images/:id/toggle — เปิด/ปิดการแสดงผล
exports.toggleGalleryImage = async (req, res) => {
  try {
    const result = await GalleryImageModel.toggleActive(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    res.status(200).json({
      message: `Gallery image ${result.imageIsActive ? "activated" : "deactivated"}`,
      imageIsActive: result.imageIsActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
