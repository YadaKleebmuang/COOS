const TagModel = require("../models/tag.model");

exports.getAll = async (req, res, next) => {
  try {
    const tags = await TagModel.findAll();
    res.status(200).json(tags);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { tagName } = req.body;
    if (!tagName || !tagName.trim()) {
      return res.status(400).json({ message: "tagName is required" });
    }
    
    // Validate tag name format (remove # if exists)
    const formattedTag = tagName.trim().replace(/^#/, '');
    if (!formattedTag) {
      return res.status(400).json({ message: "Invalid tag name" });
    }

    const result = await TagModel.create(formattedTag);
    res.status(201).json({ message: "สร้างแฮชแท็กสำเร็จ", tagId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "ชื่อแฮชแท็กนี้มีอยู่แล้ว" });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tagName } = req.body;
    
    if (!tagName || !tagName.trim()) {
      return res.status(400).json({ message: "tagName is required" });
    }

    const formattedTag = tagName.trim().replace(/^#/, '');
    if (!formattedTag) {
      return res.status(400).json({ message: "Invalid tag name" });
    }

    const result = await TagModel.update(id, formattedTag);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบแฮชแท็กนี้" });
    }
    res.status(200).json({ message: "อัปเดตแฮชแท็กสำเร็จ" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "ชื่อแฮชแท็กนี้มีอยู่แล้ว" });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await TagModel.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบแฮชแท็กนี้" });
    }
    res.status(200).json({ message: "ลบแฮชแท็กสำเร็จ" });
  } catch (err) {
    next(err);
  }
};
