module.exports = (err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.message);
  console.error("Stack:", err.stack);
  
  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : "Server Error"
  });
};
