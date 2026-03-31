const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { submitCode, executeCode } = require("../controllers/codingController");

// Execute code (test run)
router.post("/execute", executeCode);

// Submit final solution
router.post("/submit", auth, submitCode);

module.exports = router;
