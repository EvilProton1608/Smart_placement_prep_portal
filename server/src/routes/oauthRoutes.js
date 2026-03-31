const router = require("express").Router();
const { googleAuth, githubAuth } = require("../controllers/oauthController");
const { githubCallback } = require("../controllers/githubCallbackController");

// OAuth Routes
router.post("/google", googleAuth);
router.post("/github", githubAuth);
router.post("/github/callback", githubCallback);

module.exports = router;
