const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("src/uploads"));

/*
==============================
   ROOT ROUTE (TEST SERVER)
==============================
*/
app.get("/", (req, res) => {
  res.send("🚀 Smart Placement Portal API is running");
});

/*
==============================
        API ROUTES
==============================
*/
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/oauth", require("./routes/oauthRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/coding", require("./routes/codingRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));

/*
==============================
      ERROR HANDLER
==============================
*/
app.use(errorHandler);

module.exports = app;
