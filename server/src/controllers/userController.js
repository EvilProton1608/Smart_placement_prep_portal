const prisma = require("../config/db");

exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  res.json(user);
};
