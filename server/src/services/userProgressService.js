const prisma = require("../config/db");

function calculateAccuracy(correct, total) {
  return total === 0 ? 0 : (correct / total) * 100;
}

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function buildTopicsProgress(records) {
  // records: Array<{ topic: string | null, isCorrect: boolean }>
  const byTopic = new Map();

  for (const r of records) {
    const topic = r.topic ? normalizeText(r.topic) : "";
    if (!topic) continue;

    const current = byTopic.get(topic) || { total: 0, correct: 0 };
    current.total += 1;
    if (r.isCorrect) current.correct += 1;
    byTopic.set(topic, current);
  }

  const minAttempts = 3;
  const weakTopics = [];
  const strongTopics = [];

  for (const [topic, s] of byTopic.entries()) {
    if (s.total < minAttempts) continue;
    const acc = calculateAccuracy(s.correct, s.total);
    if (acc < 50) weakTopics.push({ topic, acc });
    if (acc >= 80) strongTopics.push({ topic, acc });
  }

  weakTopics.sort((a, b) => a.acc - b.acc);
  strongTopics.sort((a, b) => b.acc - a.acc);

  return {
    weakTopics: weakTopics.map((t) => t.topic).slice(0, 5),
    strongTopics: strongTopics.map((t) => t.topic).slice(0, 5)
  };
}

async function computeUserProgress(userId) {
  const [quizAttempts, codingSubs] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        question: {
          select: { type: true, topic: true }
        }
      }
    }),
    prisma.codingSubmission.findMany({
      where: { userId },
      include: {
        question: {
          select: { type: true, topic: true }
        }
      }
    })
  ]);

  const aptitudeAttempts = quizAttempts.filter((a) => a.question?.type === "aptitude");
  const aptitudeCorrect = aptitudeAttempts.filter((a) => a.isCorrect).length;
  const aptitudeAccuracy = calculateAccuracy(aptitudeCorrect, aptitudeAttempts.length);

  const codingAttempts = codingSubs.length;
  const codingCorrect = codingSubs.filter((s) => s.status === "passed").length;
  const codingAccuracy = calculateAccuracy(codingCorrect, codingAttempts);

  const topicRecords = [
    ...aptitudeAttempts.map((a) => ({ topic: a.question?.topic, isCorrect: a.isCorrect })),
    ...codingSubs.map((s) => ({ topic: s.question?.topic, isCorrect: s.status === "passed" }))
  ];

  const topics = buildTopicsProgress(topicRecords);

  return {
    aptitudeAccuracy,
    codingAccuracy,
    weakTopics: topics.weakTopics,
    strongTopics: topics.strongTopics
  };
}

async function computeAndUpsertUserProgress(userId) {
  const progress = await computeUserProgress(userId);

  const saved = await prisma.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      aptitudeAccuracy: progress.aptitudeAccuracy,
      codingAccuracy: progress.codingAccuracy,
      weakTopics: progress.weakTopics,
      strongTopics: progress.strongTopics
    },
    update: {
      aptitudeAccuracy: progress.aptitudeAccuracy,
      codingAccuracy: progress.codingAccuracy,
      weakTopics: progress.weakTopics,
      strongTopics: progress.strongTopics
    }
  });

  return saved;
}

module.exports = {
  computeUserProgress,
  computeAndUpsertUserProgress
};
