const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMockTests } = require("../controllers/testController");

router.get("/", auth, getMockTests);

module.exports = router;
