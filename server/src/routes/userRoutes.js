const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const { getProfile, getAnalytics, getMyAnalytics, updateProfile, changePassword, updateProfilePhoto } = require("../controllers/userController");

const photoStorage = multer.diskStorage({
	destination: "src/uploads",
	filename: (_, file, cb) => cb(null, Date.now() + "-profile-" + file.originalname)
});

const uploadPhoto = multer({
	storage: photoStorage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith("image/")) {
			cb(null, true);
			return;
		}
		cb(new Error("Only image files are allowed"));
	}
});

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/profile-photo", auth, uploadPhoto.single("photo"), updateProfilePhoto);
router.get("/analytics", auth, getMyAnalytics);
router.post("/change-password", auth, changePassword);
router.get("/:userId/analytics", auth, getAnalytics);

module.exports = router;
