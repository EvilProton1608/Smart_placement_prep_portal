const prisma = require("../config/db");

exports.submitCode = async (req, res) => {
  const { questionId, code, language } = req.body;

  const submission = await prisma.codingSubmission.create({
    data: {
      userId: req.user.id,
      questionId,
      code,
      language,
      status: "submitted"
    }
  });

  res.json(submission);
};
