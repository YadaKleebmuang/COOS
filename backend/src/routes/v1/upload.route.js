const express = require("express");
const router = express.Router();
const { uploadSource, uploadSlip, uploadProfile, uploadGallery } = require("../../config/upload");
const { validateMagicBytes } = require("../../middlewares/upload.middleware");
const controller = require("../../controllers/upload.controller");

/**
 * POST /api/v1/upload/source
 * อัปโหลดรูปต้นฉบับจากลูกค้า (field: "image", max 20MB)
 */
router.post("/source", uploadSource.single("image"), validateMagicBytes, controller.uploadSingle);

/**
 * POST /api/v1/upload/source/multiple
 * อัปโหลดรูปต้นฉบับหลายไฟล์ (field: "images", max 10 ไฟล์, max 20MB ต่อไฟล์)
 */
router.post("/source/multiple", uploadSource.array("images", 10), validateMagicBytes, controller.uploadMultiple);

/**
 * POST /api/v1/upload/slip
 * อัปโหลดสลิปชำระเงิน (field: "image", max 10MB)
 */
router.post("/slip", uploadSlip.single("image"), validateMagicBytes, controller.uploadSingle);

/**
 * POST /api/v1/upload/profile
 * อัปโหลดรูปโปรไฟล์ (field: "image", max 5MB)
 */
router.post("/profile", uploadProfile.single("image"), validateMagicBytes, controller.uploadSingle);

/**
 * POST /api/v1/upload/gallery
 * อัปโหลดรูปแกลเลอรี (field: "image", max 10MB)
 */
router.post("/gallery", uploadGallery.single("image"), validateMagicBytes, controller.uploadSingle);

module.exports = router;
