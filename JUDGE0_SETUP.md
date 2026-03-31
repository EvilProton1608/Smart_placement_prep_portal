# Judge0 API Setup Guide

Judge0 is a free online code execution API that supports 60+ programming languages. This project uses Judge0 CE (Community Edition) through RapidAPI.

## Quick Setup (5 minutes)

### Step 1: Get Free API Key from RapidAPI

1. Go to [RapidAPI - Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click **Sign Up** (or Sign In if you have an account)
3. Complete the signup process
4. You'll automatically be subscribed to Judge0 CE **free plan**
   - **Includes:** 100 requests/day (more than enough for learning)
   - **Speed:** Fast execution
   - **Latency:** ~500ms - 2s per request

### Step 2: Get Your API Key

1. After login, go to [RapidAPI Judge0 CE Dashboard](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Look for **"X-RapidAPI-Key"** in the right panel
3. Click the key icon to copy it

### Step 3: Add to .env File

Edit `server/.env` and replace the placeholder:

```env
JUDGE0_API_KEY=your-actual-rapidapi-key-here
```

**Example:**
```env
JUDGE0_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Step 4: Restart Backend Server

```powershell
# Terminal in server directory
npm run dev
```

You should see: `Started on port 5000`

### Step 5: Test It Works

Open VS Code integrated terminal and run:

```powershell
$body = @{
    code='console.log("Hello Judge0")'
    language='javascript'
    stdin=''
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/coding/execute `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

Expected response:
```json
{
  "output": "Hello Judge0",
  "message": "",
  "success": true,
  "status": "Accepted"
}
```

## Supported Languages

| Language   | ID  | Example                               |
|------------|-----|---------------------------------------|
| JavaScript | 63  | `console.log("Hello")`               |
| Python     | 71  | `print("Hello")`                     |
| C          | 50  | `#include <stdio.h>`                 |
| C++        | 54  | `#include <iostream>`                |
| Java       | 62  | `public class Main { ... }`          |

## Pricing & Limits

### Free Plan (Default)
- **Requests:** 100 per day
- **Response Time:** ~500ms - 2s
- **Concurrent:** 1 request at a time
- **Perfect for:** Learning, testing, personal projects

### Paid Plans (Optional)
- **Professional:** $5.99/month (25,000 requests/day)
- **Business:** $14.99/month (100,000 requests/day)

For this project, **free plan is more than enough!**

## How It Works

### Frontend Flow
1. User writes code in CodeEditor
2. Clicks "Run" or "Test Cases"
3. CodeEditor sends POST to `/api/coding/execute`
4. Backend receives: `{ code, language, stdin }`

### Backend Flow
1. **Submit to Judge0:**
   - Sends code to Judge0 API
   - Gets back a submission token
2. **Poll for Result:**
   - Checks result every 500ms (up to 20 times = 10 seconds)
   - Judge0 compiles and executes code
   - Returns stdout, stderr, status
3. **Return to Frontend:**
   - `{ output, message, success, status }`
   - `message` field has compilation errors
   - `output` field has program output

### Status Reference
| Status ID | Name             | Meaning                    |
|-----------|------------------|----------------------------|
| 1         | In Queue         | Waiting to execute        |
| 2         | Processing       | Currently executing       |
| 3         | Accepted         | Successful execution      |
| 4         | Wrong Answer     | Output doesn't match      |
| 5         | Time Limit       | Execution timeout (>10s)  |
| 6         | Runtime Error    | Program crashed           |

## Troubleshooting

### "API key not configured" Error
✅ **Solution:** 
- Make sure you added `JUDGE0_API_KEY=...` to `server/.env`
- Restart backend: `npm run dev`

### "403 Forbidden" Error
✅ **Solution:**
- API key is wrong or expired
- Get fresh key from RapidAPI dashboard
- Paste into .env file

### "Timeout" Error
✅ **Common causes:**
- Code is in infinite loop
- Judge0 API is slow (happens sometimes)
- Try again - usually works

### Code runs locally but fails on Judge0
✅ **Common issues:**
- Missing `#include <iostream>` in C++
- Missing `import java.util.*` in Java
- Using Windows-specific features in C/C++
- File I/O operations (Judge0 doesn't allow reading/writing files)

## Advanced: Using stdin (Input)

Some code needs input. Pass it via `stdin`:

```javascript
// Frontend example
const response = await axios.post('/api/coding/execute', {
  code: 'let nums = JSON.parse(require("readline").question("Enter array: "));',
  language: 'javascript',
  stdin: '[1,2,3]'  // This becomes program input
});
```

## When to Upgrade to Paid Plan

- More than 100 requests per day
- Running production/commercial service
- Need faster response times (<300ms)

For **learning and testing**, free plan is perfect!

## Support

- **Judge0 Docs:** https://judge0.com/
- **RapidAPI:** https://rapidapi.com/judge0-official/api/judge0-ce
- **Common Issues:** Check the Troubleshooting section above

## Next Steps

1. ✅ Get API key from RapidAPI
2. ✅ Add to `server/.env`
3. ✅ Restart backend (`npm run dev`)
4. ✅ Test with PowerShell command above
5. 🚀 Go to http://localhost:5173 and start coding!
