const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const { computeAndUpsertUserProgress } = require("../src/services/userProgressService");

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  const user = await prisma.user.findFirst({
    select: { id: true, email: true, name: true }
  });

  if (!user) {
    console.log("No users found. Register/login first so a user exists.");
    return;
  }

  const questions = await prisma.question.findMany({
    select: {
      id: true,
      type: true,
      options: true,
      correctAnswer: true
    }
  });

  if (!questions.length) {
    console.log("No questions found. Seed questions first.");
    return;
  }

  const attemptsToCreate = 30;
  const codingSubsToCreate = 10;

  const attempts = [];
  for (let i = 0; i < attemptsToCreate; i++) {
    const q = pickRandom(questions);

    let selectedAnswer = "submitted";
    let isCorrect = Math.random() < 0.6;

    if (Array.isArray(q.options) && q.options.length > 0) {
      if (q.correctAnswer && Math.random() < 0.6) {
        selectedAnswer = q.correctAnswer;
        isCorrect = true;
      } else {
        selectedAnswer = pickRandom(q.options);
        isCorrect = q.correctAnswer ? selectedAnswer === q.correctAnswer : isCorrect;
      }
    }

    attempts.push({
      userId: user.id,
      questionId: q.id,
      selectedAnswer,
      isCorrect,
      timeTaken: Math.floor(Math.random() * 180) + 10
    });
  }

  const result = await prisma.quizAttempt.createMany({
    data: attempts
  });

  // Also seed some coding submissions so coding progress has real-looking data
  const codingQuestions = questions.filter((q) => q.type === "coding");
  let codingSeedCount = 0;
  if (codingQuestions.length > 0) {
    const subs = [];
    for (let i = 0; i < codingSubsToCreate; i++) {
      const q = pickRandom(codingQuestions);
      const passed = Math.random() < 0.5;
      subs.push({
        userId: user.id,
        questionId: q.id,
        code: "// seeded",
        language: "javascript",
        status: passed ? "passed" : "failed"
      });
    }
    const codingRes = await prisma.codingSubmission.createMany({ data: subs });
    codingSeedCount = codingRes.count;
  }

  const progress = await computeAndUpsertUserProgress(user.id);

  console.log(
    [
      `Seeded data for ${user.email} (userId=${user.id})`,
      `- Quiz attempts: ${result.count}`,
      `- Coding submissions: ${codingSeedCount}`,
      `- Progress: aptitudeAccuracy=${Number(progress.aptitudeAccuracy || 0).toFixed(2)}%, codingAccuracy=${Number(progress.codingAccuracy || 0).toFixed(2)}%`,
      `- Weak topics: ${(progress.weakTopics || []).join(", ") || "None"}`,
      `- Strong topics: ${(progress.strongTopics || []).join(", ") || "None"}`
    ].join("\n")
  );
}

main()
  .catch((e) => {
    console.error("Seed analytics failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
