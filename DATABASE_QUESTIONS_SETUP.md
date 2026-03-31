# Database-Driven Questions Setup Guide

This guide walks you through setting up the question system to fetch from the database instead of hardcoded values.

## What Changed

✅ **Removed:** Hardcoded questions from `Coding.jsx`
✅ **Created:** `questions.json` - Central question repository
✅ **Created:** Backend API endpoint `/api/questions`
✅ **Updated:** Frontend to fetch questions from database via API

## Setup Steps

### Step 1: Seed the Database with Questions

Run this command in the `server` directory:

```powershell
cd server
npx prisma db seed
```

If this doesn't work, use the custom seed script:

```powershell
node prisma/seedQuestions.js
```

**Expected Output:**
```
🌱 Seeding database with questions...
✓ Cleared existing questions
✓ Created question: Two Sum with 3 test cases
✓ Created question: Reverse String with 3 test cases
✓ Created question: Valid Parentheses with 3 test cases
✅ Database seeding complete!
```

### Step 2: Verify Backend API

Start the backend server:

```powershell
npm run dev
```

Test the questions endpoint:

```powershell
curl http://localhost:5000/api/questions
```

Or in PowerShell:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/questions | Select -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "description": "Find two numbers that add up to a target",
      "testCases": [...]
    },
    ...
  ]
}
```

### Step 3: Start Frontend

In the `client` directory:

```powershell
npm run dev
```

Go to: `http://localhost:5173`
Navigate to the Coding page - you should see questions loaded from the database! ✅

## File Structure

```
Smart_placement_prep_portal/
├── questions.json                    # Question data (can import from LeetCode)
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── questionController.js # Question API logic
│   │   ├── routes/
│   │   │   └── questionRoutes.js    # Question endpoints
│   │   └── app.js                   # Main app (questions route added)
│   └── prisma/
│       ├── schema.prisma             # already has Question model
│       └── seedQuestions.js          # Seed script
└── client/
    └── src/
        └── pages/
            └── Coding.jsx            # Fetches from API (no hardcoding)
```

## API Endpoints

### Get All Questions
```
GET /api/questions
Response: { success: true, questions: [...] }
```

### Get Single Question
```
GET /api/questions/:id
Response: { success: true, question: {...} }
```

## Adding More Questions

### Option 1: Edit `questions.json` then re-run seed

1. Edit `questions.json` to add more problems
2. Run `node prisma/seedQuestions.js` to update database

### Option 2: Add directly to database

Create a question with test cases using Prisma:

```javascript
const question = await prisma.question.create({
  data: {
    title: "Your Problem",
    difficulty: "Easy",
    description: "Problem description",
    type: "coding",
    topic: "Arrays",
    testCases: {
      create: [
        { input: "test input", expectedOutput: "expected" },
        { input: "test input 2", expectedOutput: "expected 2" }
      ]
    }
  }
});
```

### Option 3: Import from LeetCode (Future)

You can write a script to:
1. Scrape LeetCode problems
2. Add to `questions.json`
3. Run seed script

## Troubleshooting

### "Failed to load questions" error

✅ Check backend is running on port 5000
✅ Run seed script: `node prisma/seedQuestions.js`
✅ Check database connection in .env

### Questions not showing in sidebar

✅ Seeding must complete successfully
✅ Database must have data
✅ Run: `npx prisma studio` to inspect database

### Test cases not showing

✅ TestCases must be created during seeding
✅ Check seedQuestions.js output shows test cases created
✅ Verify TestCase records in database

## Database Schema

Your schema already has everything needed:

```prisma
model Question {
  id              Int       @id @default(autoincrement())
  type            String    // "coding"
  title           String
  description     String
  difficulty      String    // "Easy", "Medium", "Hard"
  testCases       TestCase[]
}

model TestCase {
  id              Int       @id @default(autoincrement())
  input           String
  expectedOutput  String
  questionId      Int
  question        Question  @relation(fields: [questionId])
}
```

## Next Steps

1. ✅ Run seed script
2. ✅ Verify API works
3. ✅ See questions in Coding page
4. ✅ Test with sample code
5. 🚀 Add more questions as needed

---

**You now have a professional question management system like LeetCode!** 🎉
