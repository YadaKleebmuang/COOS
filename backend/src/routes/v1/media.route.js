const express = require("express");
const controller = require("../../controllers/media.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authMiddleware(req, res, next);
};

router.get("/gallery/:imageId", optionalAuth, controller.getGalleryMedia);
router.get("/order-images/:orderImageId", authMiddleware, controller.getOrderImageMedia);
router.get("/payments/:paymentId/slip", authMiddleware, controller.getPaymentSlipMedia);
router.get("/users/:userId/profile", authMiddleware, controller.getProfileMedia);

module.exports = router;
