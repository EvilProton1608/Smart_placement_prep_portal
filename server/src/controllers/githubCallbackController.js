const axios = require("axios");
const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Authorization code is required",
      });
    }

    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("❌ GitHub credentials not configured");
      return res.status(500).json({
        message: "GitHub OAuth not configured",
      });
    }

    // Exchange code for access token
    console.log("Exchanging GitHub code for access token...");
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    if (tokenResponse.data.error) {
      console.error("GitHub token error:", tokenResponse.data.error);
      return res.status(400).json({
        message: "Failed to authenticate with GitHub",
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Get user info from GitHub
    console.log("Fetching GitHub user info...");
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;
    console.log("GitHub user:", githubUser.login);

    // Get email if not public
    let email = githubUser.email;
    if (!email) {
      console.log("Getting primary email from GitHub...");
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const primaryEmail = emailResponse.data.find((e) => e.primary);
      email = primaryEmail?.email;
    }

    if (!email) {
      return res.status(400).json({
        message: "Could not retrieve email from GitHub account",
      });
    }

    // Find or create user
    console.log("Looking for user with email:", email);
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("Creating new user from GitHub data");
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
      console.log("User created:", user.id);
    } else {
      console.log("User already exists:", user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    console.log("✓ GitHub authentication successful for:", user.email);

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
      error: process.env.NODE_ENV === "development" ? err.message : "Internal error",
    });
  }
};
