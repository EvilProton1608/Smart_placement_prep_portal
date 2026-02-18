const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

module.exports = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};
