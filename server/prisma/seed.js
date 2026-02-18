const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.question.create({
    data: {
      type: "aptitude",
      title: "Next number",
      description: "2,4,8,16,?",
      difficulty: "easy",
      topic: "series",
      options: ["18","24","32","64"],
      correctAnswer: "32"
    }
  });
}

main().finally(() => prisma.$disconnect());
