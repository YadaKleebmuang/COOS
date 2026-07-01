const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report.controller");
const { authorizeRoles } = require("../../middlewares/auth.middleware");

router.use(authorizeRoles("admin")); // Require admin

router.get("/", reportController.getDashboardStats);

module.exports = router;
