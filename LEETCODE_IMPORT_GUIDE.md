# Import LeetCode Problems - Complete Guide

This guide walks you through importing LeetCode problems into your platform.

## Files Involved

- **transform-problems.js** - Transformer script (converts LeetCode format to your schema)
- **seedQuestions.js** - Updated seed script (handles both formats)
- **problems_cleaned.json** - Your downloaded LeetCode problems file
- **questions-formatted.json** - OUTPUT: Transformed questions
- **testcases-formatted.json** - OUTPUT: Separated test cases

## Step-by-Step Setup

### Step 1: Prepare Your LeetCode Problems File

You should have `problems_cleaned.json` already downloaded.

**File location:** Root of your project or anywhere accessible

### Step 2: Transform the Problems File

The transformation script converts LeetCode format to match your Prisma schema.

#### Option A: From Project Root
```powershell
cd d:\fswd_pbl\Smart_placement_prep_portal
node transform-problems.js problems_cleaned.json
```

#### Option B: With Custom Path
```powershell
node transform-problems.js C:\Users\aditya\Downloads\problems_cleaned.json
```

**Expected Output:**
```
✅ Transformation complete!
✓ Created questions-formatted.json with 2828 questions
✓ Created testcases-formatted.json with 8484 test cases

Usage:
1. Copy both files to your project root
2. Update seedQuestions.js to use the new format
3. Run: node prisma/seedQuestions.js
```

### Step 3: Move Files to Project Root

After transformation, you'll have two new files in the current directory:
- `questions-formatted.json`
- `testcases-formatted.json`

Copy them to your project root:
```powershell
# From project root, if run from Downloads folder:
Copy-Item "C:\Users\aditya\Downloads\questions-formatted.json" -Destination ".\"
Copy-Item "C:\Users\aditya\Downloads\testcases-formatted.json" -Destination ".\"
```

Verify they exist:
```powershell
dir *.json
```

You should see:
```
questions-formatted.json
testcases-formatted.json
JUDGE0_SETUP.md
```

### Step 4: Seed the Database

Go to server directory:
```powershell
cd server
```

Run the seed script:
```powershell
node prisma/seedQuestions.js
```

**Expected Output:**
```
🌱 Seeding database with questions and test cases...
📖 Using questions-formatted.json from LeetCode...
📝 Loading test cases from testcases-formatted.json...
✓ Cleared existing questions and test cases
✓ Created: Two Sum (ID: 1)
✓ Created: Add Two Numbers (ID: 2)
...
✓ Created 2800+ test cases from testcases-formatted.json

✅ Database seeding complete!
📊 Summary:
   - Questions created: 2828
   - Test cases created: 8484
```

### Step 5: Verify in Database

Open Prisma Studio to see imported questions:

```powershell
npx prisma studio
```

This opens a web interface where you can:
- View all questions
- See test cases for each question
- Search by difficulty, topic, etc.

Or query directly:
```powershell
# In your Node app
const questions = await prisma.question.findMany({
  include: { testCases: true }
});
console.log(`Total questions: ${questions.length}`);
```

### Step 6: Start the Platform

#### Terminal 1 - Backend
```powershell
cd server
npm run dev
```

#### Terminal 2 - Frontend
```powershell
cd client
npm run dev
```

#### Browser
Go to `http://localhost:5173` and navigate to **Coding**

You should see 2800+ problems loaded from database! 🎉

## File Formats

### questions-formatted.json Structure
```json
[
  {
    "type": "coding",
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "Easy",
    "topic": "Array",
    "sampleInput": "nums = [2,7,11,15], target = 9",
    "sampleOutput": "Output: [0,1]",
    "leetcodeUrl": "https://leetcode.com/problems/two-sum/"
  },
  ...
]
```

### testcases-formatted.json Structure
```json
[
  {
    "questionId": 1,
    "input": "nums = [2,7,11,15]; target = 9",
    "expectedOutput": "[0,1]",
    "description": "Test case 1"
  },
  {
    "questionId": 1,
    "input": "nums = [3,2,4]; target = 6",
    "expectedOutput": "[1,2]",
    "description": "Test case 2"
  },
  ...
]
```

## Schema Mapping

Your Prisma schema automatically handles the structure:

```prisma
model Question {
  id          Int @id @default(autoincrement())
  type        String        // "coding"
  title       String        // From LeetCode
  description String        // From LeetCode (cleaned HTML)
  difficulty  String        // "Easy", "Medium", "Hard"
  topic       String        // From topicTags
  sampleInput String?       // From sampleTestCase
  sampleOutput String?      // Extracted from examples
  testCases   TestCase[]    // Linked test cases
}

model TestCase {
  id              Int     @id @default(autoincrement())
  input           String  // From test case input
  expectedOutput  String  // From test case output
  questionId      Int
  question        Question @relation(fields: [questionId])
}
```

## Customization

### Change Number of Problems to Import

Edit `transform-problems.js` at this line:

```javascript
problem.testCases.slice(0, 3).forEach((testCase, tcIndex) => {
  // Change 0 (first problem) or 3 (test cases per problem)
});

// Similarly, limit problems:
for (let i = 0; i < questionsData.length; i++) {  // <- Change to questionsData.length / 2
```

Then re-run transformation.

### Filter by Difficulty

Modify `transform-problems.js`:

```javascript
const easyOnly = problemsData.problems.filter(p => p.difficulty === 'Easy');
// Use easyOnly instead of problemsData.problems
```

### Add Custom Topics

Edit `questionsData[i]` mapping:

```javascript
const customTopics = {
  'two-sum': 'Hash Map',
  'add-two-numbers': 'Linked List',
  // Add more mappings
};

topic: customTopics[problem.slug] || problem.topicTags[0].name
```

## Troubleshooting

### "No questions file found" Error

```
❌ Error: No questions file found!
```

**Solution:**
1. Verify `problems_cleaned.json` exists in project root
2. Run: `dir problems_cleaned.json`
3. If missing, download from LeetCode again

### Test Cases Not Importing

```
⚠️ No testcases-formatted.json found
```

**Solution:**
1. Run transformation script again
2. Copy the generated `testcases-formatted.json` to project root
3. Re-run seed script

### Database Connection Error

```
❌ Can't reach database server
```

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Run: `npx prisma db push` first
4. Then run seed script

### Too Many Questions Cause Memory Issues

If you import all 2800+ problems at once:

**Solution:**
1. Edit `transform-problems.js` to limit questions
2. Import in batches:
   ```javascript
   const batch = problemsData.problems.slice(0, 100); // First 100
   ```
3. Run seed multiple times with different batches

## Performance Notes

- Seeding 2828 questions: ~2-3 minutes
- Seeding 8484 test cases: ~1-2 minutes
- Total database size: ~50-100 MB
- Frontend load time: <1 second (paginated in future)

## Next Steps

1. ✅ Transform problems
2. ✅ Seed database
3. ✅ View in platform
4. 🚀 Add pagination to handle 2800+ problems
5. 🚀 Add search/filter functionality
6. 🚀 Track user submission statistics

---

**Now you have 2828 real LeetCode problems in your platform!** 🚀
