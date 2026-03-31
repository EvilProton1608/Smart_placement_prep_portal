const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database with questions and test cases...');

    // Try to read formatted questions (from LeetCode) first, then fallback to questions.json
    let questionsData;
    let testCasesData;

    const formattedQuestionsPath = path.join(__dirname, '../../questions-formatted.json');
    const questionsPath = path.join(__dirname, '../../questions.json');
    const testCasesPath = path.join(__dirname, '../../testcases-formatted.json');

    // Check which files exist
    if (fs.existsSync(formattedQuestionsPath)) {
      console.log('📖 Using questions-formatted.json from LeetCode...');
      questionsData = JSON.parse(fs.readFileSync(formattedQuestionsPath, 'utf-8'));
    } else if (fs.existsSync(questionsPath)) {
      console.log('📖 Using questions.json...');
      questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    } else {
      throw new Error('No questions file found! Please provide questions.json or questions-formatted.json');
    }

    // Load test cases if available
    if (fs.existsSync(testCasesPath)) {
      console.log('📝 Loading test cases from testcases-formatted.json...');
      testCasesData = JSON.parse(fs.readFileSync(testCasesPath, 'utf-8'));
    } else {
      console.log('⚠️  No testcases-formatted.json found. Creating test cases from question data...');
      testCasesData = null;
    }

    // Clear existing questions and test cases
    await prisma.testCase.deleteMany({});
    await prisma.question.deleteMany({});
    console.log('✓ Cleared existing questions and test cases');

    // Seed each question
    const createdQuestions = [];
    for (let i = 0; i < questionsData.length; i++) {
      const questionData = questionsData[i];

      // Handle both array and direct object
      const question = await prisma.question.create({
        data: {
          title: questionData.title,
          difficulty: questionData.difficulty,
          description: questionData.description || '',
          type: questionData.type || 'coding',
          topic: questionData.topic || 'Algorithms',
          sampleInput: questionData.sampleInput,
          sampleOutput: questionData.sampleOutput
        }
      });

      createdQuestions.push({
        originalId: i + 1,
        dbId: question.id,
        title: question.title
      });

      console.log(`✓ Created: ${question.title} (ID: ${question.id})`);
    }

    // Seed test cases
    let testCasesCreated = 0;

    if (testCasesData && Array.isArray(testCasesData)) {
      // Use formatted test cases from file
      for (const testCase of testCasesData) {
        const questionId = createdQuestions[testCase.questionId - 1]?.dbId;
        
        if (questionId) {
          await prisma.testCase.create({
            data: {
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              questionId: questionId
            }
          });
          testCasesCreated++;
        }
      }
      console.log(`✓ Created ${testCasesCreated} test cases from testcases-formatted.json`);
    } else if (Array.isArray(questionsData[0]) === false && questionsData[0].testCases) {
      // Create from embedded testCases in questions (original format)
      for (let i = 0; i < questionsData.length; i++) {
        const questionData = questionsData[i];
        const dbQuestion = createdQuestions[i];

        if (questionData.testCases && Array.isArray(questionData.testCases)) {
          for (const tc of questionData.testCases) {
            let inputStr = '';
            let expectedStr = '';

            if (typeof tc.input === 'object') {
              inputStr = JSON.stringify(tc.input);
            } else {
              inputStr = String(tc.input);
            }

            if (typeof tc.expected === 'object') {
              expectedStr = JSON.stringify(tc.expected);
            } else {
              expectedStr = String(tc.expectedOutput || tc.expected || '');
            }

            await prisma.testCase.create({
              data: {
                input: inputStr,
                expectedOutput: expectedStr,
                questionId: dbQuestion.dbId
              }
            });
            testCasesCreated++;
          }
        }
      }
      console.log(`✓ Created ${testCasesCreated} test cases from embedded data`);
    }

    console.log('\n✅ Database seeding complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Questions created: ${createdQuestions.length}`);
    console.log(`   - Test cases created: ${testCasesCreated}`);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

