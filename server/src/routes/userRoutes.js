const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, getAnalytics, updateProfile, changePassword } = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);
router.get("/:userId/analytics", getAnalytics);

module.exports = router;
