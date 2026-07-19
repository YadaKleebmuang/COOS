const express = require("express");
const controller = require("../../controllers/galleryImage.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminOnly = require("../../middlewares/admin.middleware");
const { uploadGallery } = require("../../config/upload");
const { validateMagicBytes } = require("../../middlewares/upload.middleware");

const router = express.Router();

// Public routes — ไม่ต้อง login
router.get("/", controller.getGalleryImages);
router.get("/tags", controller.getTags);
router.get("/:id", controller.getGalleryImageById);

// Admin only routes — ต้อง login + ต้องเป็น admin
router.post("/", authMiddleware, adminOnly, uploadGallery.single("image"), validateMagicBytes, controller.createGalleryImage);
router.patch("/:id", authMiddleware, adminOnly, uploadGallery.single("image"), validateMagicBytes, controller.updateGalleryImage);
router.patch("/:id/toggle", authMiddleware, adminOnly, controller.toggleGalleryImage);
router.delete("/:id", authMiddleware, adminOnly, controller.deleteGalleryImage);

module.exports = router;
