const express = require("express");
const router = express.Router();
const fileController = require("../../controllers/file.controller");
const { authorizeRoles } = require("../../middlewares/auth.middleware");

// Require admin access for the global files view
router.use(authorizeRoles("admin"));

router.get("/", fileController.getAllFiles);

module.exports = router;
