const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Handle Google OAuth callback
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Email and Google ID required" });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user from Google data
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          password: await bcrypt.hash(googleId, 10), // Use googleId as password
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ Google auth error:", err.message);
    res.status(500).json({
      message: "Google authentication failed",
      error: err.message,
    });
  }
};

// Handle GitHub OAuth callback
exports.githubAuth = async (req, res) => {
  try {
    const { email, name, githubId, avatarUrl } = req.body;

    if (!email || !githubId) {
      return res.status(400).json({ message: "Email and GitHub ID required" });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user from GitHub data
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          password: await bcrypt.hash(githubId, 10), // Use githubId as password
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "GitHub login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ GitHub auth error:", err.message);
    res.status(500).json({
      message: "GitHub authentication failed",
      error: err.message,
    });
  }
};
