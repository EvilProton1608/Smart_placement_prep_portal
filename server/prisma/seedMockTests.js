const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const topics = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Computer Fundamentals",
  "Data Structures",
];

function buildQuestion(index) {
  const topic = topics[index % topics.length];
  const difficulty = index < 35 ? "Easy" : index < 75 ? "Medium" : "Hard";

  if (topic === "Quantitative Aptitude") {
    const base = 12 + index;
    const percent = [5, 10, 15, 20][index % 4];
    const answer = String(base + (base * percent) / 100);

    return {
      type: "aptitude",
      title: `Percentage Increase ${index + 1}`,
      description: `A value of ${base} is increased by ${percent}%. What is the new value?`,
      difficulty,
      topic,
      options: [
        answer,
        String(base + percent),
        String(base - percent),
        String(base + (base * (percent + 5)) / 100),
      ],
      correctAnswer: answer,
      explanation: `New value = ${base} + ${percent}% of ${base} = ${answer}.`,
    };
  }

  if (topic === "Logical Reasoning") {
    const start = 3 + index;
    const step = 2 + (index % 5);
    const answer = String(start + step * 4);

    return {
      type: "aptitude",
      title: `Number Series ${index + 1}`,
      description: `Find the next number in the series: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ?`,
      difficulty,
      topic,
      options: [
        String(start + step * 3 + 1),
        answer,
        String(start + step * 5),
        String(start + step * 4 + 2),
      ],
      correctAnswer: answer,
      explanation: `The series increases by ${step} each time.`,
    };
  }

  if (topic === "Verbal Ability") {
    const pairs = [
      ["Abundant", "Plentiful", "Scarce", "Tiny", "Brief"],
      ["Rapid", "Fast", "Late", "Weak", "Silent"],
      ["Assist", "Help", "Delay", "Ignore", "Hide"],
      ["Accurate", "Correct", "Dull", "Random", "Loose"],
      ["Brief", "Short", "Large", "Heavy", "Sharp"],
    ];
    const [word, answer, ...wrong] = pairs[index % pairs.length];

    return {
      type: "aptitude",
      title: `Synonym ${index + 1}`,
      description: `Choose the synonym of "${word}".`,
      difficulty,
      topic,
      options: [wrong[0], answer, wrong[1], wrong[2]],
      correctAnswer: answer,
      explanation: `${answer} is closest in meaning to ${word}.`,
    };
  }

  if (topic === "Computer Fundamentals") {
    const items = [
      {
        title: "CPU",
        answer: "Central Processing Unit",
        options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Utility"],
      },
      {
        title: "RAM",
        answer: "Random Access Memory",
        options: ["Read Access Memory", "Random Access Memory", "Rapid Action Module", "Runtime Access Mode"],
      },
      {
        title: "HTTP",
        answer: "HyperText Transfer Protocol",
        options: ["HighText Transfer Protocol", "HyperText Transfer Protocol", "Hyperlink Text Process", "Host Transfer Text Protocol"],
      },
      {
        title: "URL",
        answer: "Uniform Resource Locator",
        options: ["Universal Route Link", "Uniform Resource Locator", "User Resource List", "Unified Record Locator"],
      },
      {
        title: "DBMS",
        answer: "Database Management System",
        options: ["Data Backup Management Software", "Database Management System", "Digital Base Memory Store", "Database Mapping Service"],
      },
    ];
    const item = items[index % items.length];

    return {
      type: "aptitude",
      title: `Computer Abbreviation ${index + 1}`,
      description: `What does ${item.title} stand for?`,
      difficulty,
      topic,
      options: item.options,
      correctAnswer: item.answer,
      explanation: `${item.title} stands for ${item.answer}.`,
    };
  }

  const structures = [
    {
      title: "Which data structure follows FIFO?",
      answer: "Queue",
      options: ["Stack", "Queue", "Tree", "Graph"],
    },
    {
      title: "Which data structure follows LIFO?",
      answer: "Stack",
      options: ["Queue", "Stack", "Array", "Heap"],
    },
    {
      title: "Which structure is best for key-value lookup?",
      answer: "Hash Map",
      options: ["Queue", "Linked List", "Hash Map", "Stack"],
    },
    {
      title: "Which traversal visits root before subtrees?",
      answer: "Preorder",
      options: ["Inorder", "Postorder", "Preorder", "Level only"],
    },
    {
      title: "Which structure represents hierarchical data?",
      answer: "Tree",
      options: ["Array", "Tree", "Queue", "Stack"],
    },
  ];
  const structure = structures[index % structures.length];

  return {
    type: "aptitude",
    title: `Data Structure Concept ${index + 1}`,
    description: structure.title,
    difficulty,
    topic,
    options: structure.options,
    correctAnswer: structure.answer,
    explanation: `${structure.answer} is the correct concept for this question.`,
  };
}

async function createMockTest(title, duration, questions) {
  let test = await prisma.mockTest.findFirst({
    where: { title },
  });

  if (!test) {
    test = await prisma.mockTest.create({
      data: { title, duration },
    });
  }

  for (const question of questions) {
    const existingLink = await prisma.mockTestQuestion.findFirst({
      where: {
        testId: test.id,
        questionId: question.id,
      },
    });

    if (!existingLink) {
      await prisma.mockTestQuestion.create({
        data: {
          testId: test.id,
          questionId: question.id,
        },
      });
    }
  }

  return test;
}

async function createQuestionIfMissing(data) {
  const existingQuestion = await prisma.question.findFirst({
    where: {
      type: data.type,
      title: data.title,
    },
  });

  if (existingQuestion) {
    return existingQuestion;
  }

  return prisma.question.create({
    data,
  });
}

async function main() {
  console.log("Seeding mock test question bank...");

  const questionData = Array.from({ length: 100 }, (_, index) =>
    buildQuestion(index)
  );

  const questions = [];
  for (const data of questionData) {
    const question = await createQuestionIfMissing(data);
    questions.push(question);
  }

  await createMockTest("Placement Mock Test - 100 Questions", 120, questions);
  await createMockTest(
    "Quick Placement Assessment - 30 Questions",
    45,
    questions.slice(0, 30)
  );
  await createMockTest(
    "Advanced Placement Drill - 40 Questions",
    60,
    questions.slice(60, 100)
  );

  console.log(`Seeded or verified ${questions.length} aptitude questions and 3 mock tests.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
