const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { submitCode } = require("../controllers/codingController");

router.post("/submit", auth, submitCode);

module.exports = router;
