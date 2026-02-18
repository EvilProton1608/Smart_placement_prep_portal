const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
