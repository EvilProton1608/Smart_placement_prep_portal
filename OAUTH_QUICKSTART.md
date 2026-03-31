# 🔐 OAuth Setup - Quick Start

## 📋 What Was Added

✅ **Backend OAuth Controllers** - Handle Google & GitHub authentication
✅ **OAuth Routes** - API endpoints for OAuth callbacks  
✅ **Register Page with OAuth Buttons** - Google & GitHub sign-in options
✅ **GitHub Callback Handler** - Frontend page to handle GitHub redirect
✅ **OAuth Service** - Frontend service to communicate with backend

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Google Client ID (2 min)
1. Visit: https://console.cloud.google.com/
2. Create Project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add Authorized redirect URI: `http://localhost:5173`
5. Copy Client ID

### Step 2: Add Google ID to Frontend (30 sec)
Edit `client/.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=paste_your_google_client_id_here
```

### Step 3: Get GitHub Client ID & Secret (2 min)
1. Visit: https://github.com/settings/developers
2. New OAuth App
3. Fill:
   - Name: `Smart Placement Prep Portal`
   - Homepage: `http://localhost:5173`
   - Callback: `http://localhost:5173/auth/github/callback`
4. Copy Client ID and generate Client Secret

### Step 4: Add GitHub Credentials to Backend (30 sec)
Edit `server/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Step 5: Update Frontend Routes (30 sec)
Open `client/src/routes.jsx` or your main routing file and add:
```javascript
import GitHubCallback from './pages/GitHubCallback';

// In your routes array, add:
{
  path: "/auth/github/callback",
  element: <GitHubCallback />
}
```

### Step 6: Restart Servers (done!)
```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend  
cd client && npm run dev
```

---

## ✅ Test It
1. Go to: `http://localhost:5173/register`
2. Click "Continue with Google" → Sign in with your Google account
3. Or click "GitHub" → Authorize your GitHub app
4. Should be logged in and redirected home!

---

## 📁 Files Created/Modified

**New Backend Files:**
- `server/src/controllers/oauthController.js` - Google & GitHub auth handlers
- `server/src/controllers/githubCallbackController.js` - GitHub callback handler
- `server/src/routes/oauthRoutes.js` - OAuth API routes

**New Frontend Files:**
- `client/src/pages/GitHubCallback.jsx` - GitHub redirect handler
- `client/src/services/oauthService.js` - OAuth API service
- `client/.env.local` - Environment variables

**Modified Files:**
- `client/src/pages/Register.jsx` - Added OAuth buttons
- `client/src/styles/Auth.css` - OAuth button styles
- `server/src/app.js` - Added OAuth routes

---

## 🔑 Environment Variables

**Frontend** (`client/.env.local`):
```
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GITHUB_CLIENT_ID=your_client_id
```

**Backend** (`server/.env`):
```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Google button not showing" | Check VITE_GOOGLE_CLIENT_ID in .env.local |
| "GitHub redirect fails" | Verify callback URL matches GitHub OAuth settings |
| "Email not found" | Make GitHub email public or primary |
| "Token not saving" | Check localStorage in DevTools (F12) |

---

## 📖 Full Documentation
See `docs/OAUTH_SETUP.md` for detailed setup instructions.

Done! Happy authenticating! 🎉
