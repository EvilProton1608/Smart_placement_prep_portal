const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getQuestions, submitAnswer } = require("../controllers/quizController");

router.get("/", auth, getQuestions);
router.post("/submit", auth, submitAnswer);

module.exports = router;
