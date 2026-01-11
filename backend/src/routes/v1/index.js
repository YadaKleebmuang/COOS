const express = require("express");
const userRoutes = require("./user.route");
const productRoutes = require("./product.route");
const auth = require("./auth.route");

const router = express.Router();

// index คือการรวบรวม route ย่อยทั้งหมดไว้
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/auth", auth);

module.exports = router;
