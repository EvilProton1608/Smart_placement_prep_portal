# OAuth Setup Guide - Google & GitHub Authentication

## ✅ What's Already Done
- ✓ OAuth controllers created in backend
- ✓ OAuth routes added
- ✓ Register page updated with OAuth buttons
- ✓ OAuth service created for API calls
- ✓ Environment variables template created

---

## 🔐 Step 1: Setup Google OAuth

### 1.1 Create Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `http://localhost:5173/auth/google/callback`
7. Copy your **Client ID** (keep Client Secret safe in backend)

### 1.2 Add Google Client ID to Frontend
Edit `client/.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 1.3 Test Google Login
1. Go to Register page
2. You should see "Continue with Google" button
3. Click it and authorize

---

## 🐙 Step 2: Setup GitHub OAuth

### 2.1 Create GitHub OAuth Application
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Smart Placement Prep Portal
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
4. Click **Create OAuth App**
5. Copy **Client ID** and generate **Client Secret**

### 2.2 Setup Backend GitHub OAuth Endpoint
Create `server/src/controllers/githubCallbackController.js`:

```javascript
const axios = require("axios");
const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.body;
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user info from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    // Get email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      email = emailResponse.data.find((e) => e.primary)?.email;
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login,
          email,
          password: await bcrypt.hash(githubUser.id.toString(), 10),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "GitHub login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ GitHub callback error:", err.message);
    res.status(500).json({
      message: "GitHub authentication failed",
      error: err.message,
    });
  }
};
```

### 2.3 Add GitHub Callback Route
Update `server/src/routes/oauthRoutes.js`:
```javascript
const router = require("express").Router();
const { googleAuth, githubAuth } = require("../controllers/oauthController");
const { githubCallback } = require("../controllers/githubCallbackController");

router.post("/google", googleAuth);
router.post("/github", githubAuth);
router.post("/github/callback", githubCallback);

module.exports = router;
```

### 2.4 Add Environment Variables to `.env`
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2.5 Add Route to Frontend Routes
Update `client/src/routes.jsx` or `main.jsx`:
```javascript
import GitHubCallback from './pages/GitHubCallback';

// Add to routes:
{
  path: "/auth/github/callback",
  element: <GitHubCallback />
}
```

---

## 🧪 Testing

### Test Google Login:
1. Go to `http://localhost:5173/register`
2. Click "Continue with Google" button
3. Sign in with your Google account
4. Should see success message and be redirected

### Test GitHub Login:
1. Go to `http://localhost:5173/register`
2. Click "GitHub" button
3. Authorize your GitHub app
4. Should see success message and be redirected

---

## 🐛 Troubleshooting

### "Google client ID not found"
- Check `.env.local` has `VITE_GOOGLE_CLIENT_ID` set
- Restart dev server after adding env vars

### "GitHub authentication failed"
- Verify callback URL matches exactly in GitHub settings
- Check that `GITHUB_CLIENT_SECRET` is in server `.env`
- Check server logs for actual error message

### "Email not found from GitHub"
- Make sure GitHub email is public or primary
- Fallback: use GitHub login as username alternative

---

## 📋 Checklist

- [ ] Created Google OAuth app
- [ ] Added Google Client ID to `client/.env.local`
- [ ] Created GitHub OAuth app
- [ ] Added GitHub credentials to `server/.env`
- [ ] Created GitHub callback controller
- [ ] Added GitHub callback route
- [ ] Added GitHub callback page to frontend routes
- [ ] Tested Google login
- [ ] Tested GitHub login
