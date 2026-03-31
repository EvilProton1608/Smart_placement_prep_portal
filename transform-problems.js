const fs = require('fs');
const path = require('path');

// Read the downloaded problems file
const problemsFile = process.argv[2] || 'problems_cleaned.json';
const problemsData = JSON.parse(fs.readFileSync(problemsFile, 'utf-8'));

const formattedQuestions = [];
const formattedTestCases = [];
let testCaseId = 1;
let questionId = 1;

// Transform each problem to match schema
problemsData.problems.forEach((problem) => {
  // Clean HTML from description
  const cleanDescription = problem.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
    .substring(0, 500); // Limit description length

  // Extract topic from topicTags or use default
  const topic = problem.topicTags && problem.topicTags.length > 0
    ? problem.topicTags[0].name || 'Algorithms'
    : 'Algorithms';

  // Create question object
  const question = {
    type: 'coding',
    title: problem.title,
    description: cleanDescription,
    difficulty: problem.difficulty,
    topic: topic,
    companyTag: null,
    sampleInput: problem.sampleTestCase || 'See test cases',
    sampleOutput: 'See expected output',
    leetcodeUrl: problem.leetcodeUrl
  };

  formattedQuestions.push(question);

  // Transform test cases
  if (problem.testCases && Array.isArray(problem.testCases)) {
    problem.testCases.slice(0, 3).forEach((testCase, tcIndex) => {
      try {
        // Format input - stringify if object
        let inputStr = '';
        if (typeof testCase.input === 'object') {
          inputStr = JSON.stringify(testCase.input).replace(/"/g, '');
        } else {
          inputStr = String(testCase.input);
        }

        // Format expected output
        let expectedStr = String(testCase.expectedOutput);

        const tc = {
          questionId: questionId,
          input: inputStr,
          expectedOutput: expectedStr,
          description: `Test case ${tcIndex + 1}`
        };

        formattedTestCases.push(tc);
        testCaseId++;
      } catch (e) {
        console.error(`Error processing test case for ${problem.title}:`, e.message);
      }
    });
  }

  questionId++;
});

// Write formatted questions
fs.writeFileSync(
  'questions-formatted.json',
  JSON.stringify(formattedQuestions, null, 2),
  'utf-8'
);

// Write formatted test cases
fs.writeFileSync(
  'testcases-formatted.json',
  JSON.stringify(formattedTestCases, null, 2),
  'utf-8'
);

console.log(`✅ Transformation complete!`);
console.log(`✓ Created questions-formatted.json with ${formattedQuestions.length} questions`);
console.log(`✓ Created testcases-formatted.json with ${formattedTestCases.length} test cases`);
console.log('\nUsage:');
console.log('1. Copy both files to your project root');
console.log('2. Update seedQuestions.js to use the new format');
console.log('3. Run: node prisma/seedQuestions.js');
