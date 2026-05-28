const prisma = require("../config/db");
const { computeAndUpsertUserProgress } = require("../services/userProgressService");

exports.getQuestions = async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { type: "aptitude" }
  });
  res.json(questions);
};

exports.submitAnswer = async (req, res) => {
  const { questionId, answer, timeTaken } = req.body;

  const question = await prisma.question.findUnique({
    where: { id: questionId }
  });

  const correct = question.correctAnswer === answer;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: req.user.id,
      questionId,
      selectedAnswer: answer,
      isCorrect: correct,
      timeTaken
    }
  });

  await computeAndUpsertUserProgress(req.user.id);

  res.json({ correct });
};
