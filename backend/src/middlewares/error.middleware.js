const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught:", err);

  // default to 500 server error
  const statusCode = err.statusCode || 500;
  
  // Custom error code or default
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  
  // Custom message or default
  const message = err.message || "เกิดข้อผิดพลาดภายในระบบ";

  // Hide stack trace in production or always as per BUG-09
  res.status(statusCode).json({
    code: errorCode,
    message: message
  });
};

module.exports = errorHandler;
