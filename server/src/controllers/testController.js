const prisma = require("../config/db");

exports.getMockTests = async (req, res) => {
  try {
    const tests = await prisma.mockTest.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(tests);
  } catch (err) {
    console.error("Error fetching mock tests:", err);
    res.status(500).json({ message: "Failed to fetch mock tests" });
  }
};

exports.getMockTestQuestions = async (req, res) => {
  try {
    const testId = Number(req.params.id);

    if (!Number.isInteger(testId)) {
      return res.status(400).json({ message: "Invalid test id" });
    }

    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    const questions = test.questions.map(({ question }) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      topic: question.topic,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
    }));

    res.json(questions);
  } catch (err) {
    console.error("Error fetching mock test questions:", err);
    res.status(500).json({ message: "Failed to fetch mock test questions" });
  }
};

exports.submitMockTest = async (req, res) => {
  try {
    const { testId, score } = req.body;
    const parsedTestId = Number(testId);
    const parsedScore = Number(score);

    if (!Number.isInteger(parsedTestId) || !Number.isFinite(parsedScore)) {
      return res.status(400).json({ message: "Invalid test result" });
    }

    const result = await prisma.mockTestResult.create({
      data: {
        testId: parsedTestId,
        userId: req.user.id,
        score: parsedScore,
      },
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Error submitting mock test:", err);
    res.status(500).json({ message: "Failed to submit mock test" });
  }
};
