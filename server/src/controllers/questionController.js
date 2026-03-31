const prisma = require("../config/db");

// Get all coding questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        type: "coding"
      },
      include: {
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Format response to match frontend expectations
    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      description: q.description,
      example: q.sampleInput && q.sampleOutput ? 
        `Input: ${q.sampleInput}\nOutput: ${q.sampleOutput}` : 
        `Example: ${q.title}`,
      testCases: q.testCases.map((tc, tcIdx) => ({
        id: tcIdx + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        description: `Test case ${tcIdx + 1}`
      }))
    }));

    res.json({
      success: true,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    res.status(500).json({
      message: "Error fetching questions",
      error: err.message
    });
  }
};

// Get single question by ID
exports.getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found"
      });
    }

    // Ensure only coding type questions are returned
    if (question.type !== "coding") {
      return res.status(403).json({
        message: "This question is not a coding problem"
      });
    }

    // Format response
    const formattedQuestion = {
      id: question.id,
      title: question.title,
      difficulty: question.difficulty,
      description: question.description,
      example: question.sampleInput && question.sampleOutput ?
        `Input: ${question.sampleInput}\nOutput: ${question.sampleOutput}` :
        `Example: ${question.title}`,
      testCases: question.testCases.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        description: `Test case ${idx + 1}`
      }))
    };

    res.json({
      success: true,
      question: formattedQuestion
    });
  } catch (err) {
    console.error("Error fetching question:", err.message);
    res.status(500).json({
      message: "Error fetching question",
      error: err.message
    });
  }
};

// Get all aptitude questions
exports.getAptitudeQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        type: "aptitude"
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Format response for MCQ display
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      topic: q.topic,
      options: q.options && Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    }));

    res.json({
      success: true,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error("Error fetching aptitude questions:", err.message);
    res.status(500).json({
      message: "Error fetching aptitude questions",
      error: err.message
    });
  }
};

// Get single aptitude question by ID
exports.getAptitudeQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found"
      });
    }

    // Ensure only aptitude type questions are returned
    if (question.type !== "aptitude") {
      return res.status(403).json({
        message: "This question is not an aptitude problem"
      });
    }

    // Format response
    const formattedQuestion = {
      id: question.id,
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      topic: question.topic,
      options: question.options && Array.isArray(question.options) ? question.options : [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    };

    res.json({
      success: true,
      question: formattedQuestion
    });
  } catch (err) {
    console.error("Error fetching aptitude question:", err.message);
    res.status(500).json({
      message: "Error fetching aptitude question",
      error: err.message
    });
  }
};

// Submit aptitude answer and check
exports.submitAptitudeAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer, userId } = req.body;

    if (!questionId || !selectedAnswer) {
      return res.status(400).json({
        message: "questionId and selectedAnswer are required"
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question || question.type !== "aptitude") {
      return res.status(404).json({
        message: "Aptitude question not found"
      });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Record the attempt if userId is provided
    if (userId) {
      await prisma.quizAttempt.create({
        data: {
          userId: parseInt(userId),
          questionId: parseInt(questionId),
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
          timeTaken: 0
        }
      });
    }

    res.json({
      success: true,
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer'
    });
  } catch (err) {
    console.error("Error submitting answer:", err.message);
    res.status(500).json({
      message: "Error submitting answer",
      error: err.message
    });
  }
};

