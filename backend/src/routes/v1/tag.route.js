const express = require("express");
const controller = require("../../controllers/tag.controller");
const adminOnly = require("../../middlewares/admin.middleware");

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", adminOnly, controller.create);
router.patch("/:id", adminOnly, controller.update);
router.delete("/:id", adminOnly, controller.remove);

module.exports = router;
