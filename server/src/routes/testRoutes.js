const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getMockTests,
  getMockTestQuestions,
  submitMockTest,
} = require("../controllers/testController");

router.get("/", auth, getMockTests);
router.get("/available", auth, getMockTests);
router.post("/submit", auth, submitMockTest);
router.get("/:id", auth, getMockTestQuestions);

module.exports = router;
