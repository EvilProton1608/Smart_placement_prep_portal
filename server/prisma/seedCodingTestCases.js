const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const codingTestCases = {
  "Reverse String": {
    sampleInput: "hello",
    sampleOutput: "olleh",
    description:
      "Read a string from standard input and print the reversed string.",
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "placement", expectedOutput: "tnemecalp" },
      { input: "a", expectedOutput: "a" },
      { input: "madam", expectedOutput: "madam" },
    ],
  },
  "Valid Parentheses": {
    sampleInput: "()[]{}",
    sampleOutput: "true",
    description:
      "Read a bracket string from standard input and print true if all brackets are valid, otherwise print false.",
    testCases: [
      { input: "()[]{}", expectedOutput: "true" },
      { input: "([{}])", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true" },
    ],
  },
  "Two Sum": {
    sampleInput: "4\n2 7 11 15\n9",
    sampleOutput: "0 1",
    description:
      "Read n from the first line, an array of n integers from the second line, and a target from the third line. Print the two zero-based indices separated by a space.",
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2" },
      { input: "2\n3 3\n6", expectedOutput: "0 1" },
      { input: "4\n1 5 8 10\n18", expectedOutput: "2 3" },
    ],
  },
};

async function addTestCaseIfMissing(questionId, testCase) {
  const existingTestCase = await prisma.testCase.findFirst({
    where: {
      questionId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
    },
  });

  if (existingTestCase) {
    return false;
  }

  await prisma.testCase.create({
    data: {
      questionId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
    },
  });

  return true;
}

async function main() {
  console.log("Seeding coding test cases...");

  let createdCount = 0;

  for (const [title, data] of Object.entries(codingTestCases)) {
    const question = await prisma.question.findFirst({
      where: {
        type: "coding",
        title,
      },
    });

    if (!question) {
      console.warn(`Skipping "${title}" because the coding question was not found.`);
      continue;
    }

    await prisma.question.update({
      where: { id: question.id },
      data: {
        description: data.description,
        sampleInput: data.sampleInput,
        sampleOutput: data.sampleOutput,
      },
    });

    await prisma.testCase.deleteMany({
      where: { questionId: question.id },
    });

    for (const testCase of data.testCases) {
      const created = await addTestCaseIfMissing(question.id, testCase);
      if (created) {
        createdCount++;
      }
    }

    console.log(`Verified test cases for "${title}".`);
  }

  console.log(`Created ${createdCount} new coding test cases.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
