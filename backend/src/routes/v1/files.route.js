const express = require("express");
const router = express.Router();
const fileController = require("../../controllers/file.controller");
const adminOnly = require("../../middlewares/admin.middleware");

// authMiddleware applied globally in index.js — only need adminOnly here
router.use(adminOnly);

router.get("/", fileController.getAllFiles);

module.exports = router;
