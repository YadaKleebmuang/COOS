const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report.controller");
const adminOnly = require("../../middlewares/admin.middleware");

// authMiddleware applied globally in index.js — only need adminOnly here
router.use(adminOnly);

router.get("/", reportController.getDashboardStats);

module.exports = router;
