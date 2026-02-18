const prisma = require("../config/db");

exports.getMockTests = async (req, res) => {
  const tests = await prisma.mockTest.findMany();
  res.json(tests);
};
