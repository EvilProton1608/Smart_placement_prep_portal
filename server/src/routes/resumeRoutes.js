const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const { uploadResume } = require("../controllers/resumeController");

const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/", auth, upload.single("resume"), uploadResume);

module.exports = router;
