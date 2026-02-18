const prisma = require("../config/db");

exports.uploadResume = async (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;

  const resume = await prisma.resume.create({
    data: {
      userId: req.user.id,
      fileUrl
    }
  });

  res.json(resume);
};
