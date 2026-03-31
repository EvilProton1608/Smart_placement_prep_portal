const prisma = require("../config/db");
const { analyzeResume } = require("../services/resumeAnalyzerService");

exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No resume file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  // Placeholder analysis (service can be expanded later to parse PDF/DOCX)
  const analysis = analyzeResume("");
  const feedbackText = Array.isArray(analysis?.suggestions)
    ? analysis.suggestions.map((s) => `• ${s}`).join("\n")
    : null;

  const resume = await prisma.resume.create({
    data: {
      userId: req.user.id,
      fileUrl,
      atsScore: typeof analysis?.score === "number" ? analysis.score : null,
      feedback: feedbackText
    }
  });

  res.json(resume);
};

