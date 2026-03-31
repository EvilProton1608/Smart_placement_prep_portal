const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Only delete aptitude questions and quiz attempts, preserve coding questions
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({
    where: { type: "aptitude" }
  });

  // Add sample aptitude questions
  await prisma.question.createMany({
    data: [
      {
        type: "aptitude",
        title: "Series Number - Powers of 2",
        description: "Find the next number in the series: 2, 4, 8, 16, ?",
        difficulty: "easy",
        topic: "series",
        options: ["18", "24", "32", "64"],
        correctAnswer: "32",
        explanation: "Each number is double the previous number. 2×2=4, 4×2=8, 8×2=16, 16×2=32"
      },
      {
        type: "aptitude",
        title: "Percentage Calculation",
        description: "If a product cost is Rs 500 and it's sold at 20% profit, what is the selling price?",
        difficulty: "easy",
        topic: "percentage",
        options: ["Rs 600", "Rs 580", "Rs 620", "Rs 500"],
        correctAnswer: "Rs 600",
        explanation: "Profit = 20% of Rs 500 = 100. Selling Price = Cost Price + Profit = 500 + 100 = Rs 600"
      },
      {
        type: "aptitude",
        title: "Number Series - Arithmetic",
        description: "Find the next number in the series: 5, 10, 15, 20, ?",
        difficulty: "easy",
        topic: "series",
        options: ["25", "30", "35", "40"],
        correctAnswer: "25",
        explanation: "This is an arithmetic series with common difference 5. Each number increases by 5 from the previous number."
      },
      {
        type: "aptitude",
        title: "Age Problem",
        description: "The present age of John is 5 times his son's age. 5 years ago, it was 10 times. What is John's current age?",
        difficulty: "medium",
        topic: "age",
        options: ["40 years", "45 years", "50 years", "55 years"],
        correctAnswer: "50 years",
        explanation: "Let son's age be x, John's age be 5x. 5 years ago: (5x-5) = 10(x-5). Solving: 5x-5 = 10x-50, so 5x = 45, x = 9. John's age = 5×9 = 45 years"
      },
      {
        type: "aptitude",
        title: "Speed and Distance",
        description: "A train travels 100 km in 2 hours. What is its average speed?",
        difficulty: "easy",
        topic: "speed_distance",
        options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
        correctAnswer: "50 km/h",
        explanation: "Speed = Distance / Time = 100 km / 2 hours = 50 km/h"
      },
      {
        type: "aptitude",
        title: "Simple Interest",
        description: "What is the simple interest on Rs 1000 at 5% per annum for 2 years?",
        difficulty: "easy",
        topic: "interest",
        options: ["Rs 100", "Rs 150", "Rs 200", "Rs 250"],
        correctAnswer: "Rs 100",
        explanation: "Simple Interest = (Principal × Rate × Time) / 100 = (1000 × 5 × 2) / 100 = Rs 100"
      },
      {
        type: "aptitude",
        title: "Odd One Out",
        description: "Which one is different from the others? Apple, Banana, Carrot, Orange",
        difficulty: "easy",
        topic: "logic",
        options: ["Apple", "Banana", "Carrot", "Orange"],
        correctAnswer: "Carrot",
        explanation: "Carrot is the odd one out because it's a vegetable, while all others are fruits."
      },
      {
        type: "aptitude",
        title: "Ratio Problem",
        description: "If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?",
        difficulty: "medium",
        topic: "ratio",
        options: ["8", "10", "12", "14"],
        correctAnswer: "10",
        explanation: "If ratio is 3:2 and boys are 15, then girls = (2/3) × 15 = 10"
      },
      {
        type: "aptitude",
        title: "Work Problem",
        description: "If A can complete a work in 5 days and B can complete the same work in 10 days, how many days will they take working together?",
        difficulty: "medium",
        topic: "work",
        options: ["3 days", "3.33 days", "3.5 days", "4 days"],
        correctAnswer: "3.33 days",
        explanation: "A's work per day = 1/5, B's work per day = 1/10. Combined = 1/5 + 1/10 = 3/10. Time = 10/3 = 3.33 days"
      },
      {
        type: "aptitude",
        title: "Profit and Loss",
        description: "A shopkeeper bought an item for Rs 80 and sold it for Rs 100. What is the profit percentage?",
        difficulty: "medium",
        topic: "profit_loss",
        options: ["20%", "25%", "30%", "35%"],
        correctAnswer: "25%",
        explanation: "Profit = 100 - 80 = 20. Profit % = (20/80) × 100 = 25%"
      }
    ]
  });

  // Add sample coding questions with test cases
  const codingQuestions = await prisma.question.createMany({
    data: [
      {
        type: "coding",
        title: "Reverse String",
        description: "Reverse a string in place",
        difficulty: "Easy",
        topic: "String",
        companyTag: "Microsoft",
        sampleInput: "hello",
        sampleOutput: "olleh"
      },
      {
        type: "coding",
        title: "Valid Parentheses",
        description: "Check if parentheses are valid",
        difficulty: "Medium",
        topic: "Stack",
        companyTag: "Google",
        sampleInput: "()[]{}",
        sampleOutput: "true"
      },
      {
        type: "coding",
        title: "Two Sum",
        description: "Find two numbers that add up to a target",
        difficulty: "Easy",
        topic: "Array",
        companyTag: "Amazon",
        sampleInput: "nums = [2,7,11,15], target = 9",
        sampleOutput: "[0,1]"
      }
    ]
  });

  console.log("✅ Sample aptitude questions added successfully!");
  console.log("✅ Sample coding questions added successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
