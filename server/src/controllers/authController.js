const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register request:", { name, email, password: "***" });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashed 
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    console.log("User registered successfully:", user.id);

    res.status(201).json({ 
      success: true,
      message: "Registration successful",
      token, 
      user 
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      message: err.message || "Error during registration",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    console.log("User logged in successfully:", user.id);

    res.json({ 
      success: true,
      message: "Login successful",
      token, 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      message: err.message || "Error during login",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
};
