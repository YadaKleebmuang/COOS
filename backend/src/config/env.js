const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const err = new Error("JWT_SECRET is not configured");
    err.statusCode = 500;
    err.code = "CONFIG_MISSING_JWT_SECRET";
    throw err;
  }

  return process.env.JWT_SECRET;
};

module.exports = {
  port: process.env.PORT || 3000,
  getJwtSecret,
};
