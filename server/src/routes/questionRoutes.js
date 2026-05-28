const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require("../middleware/authMiddleware");

// Coding Questions
router.get('/', questionController.getAllQuestions);
router.get('/coding/:id', questionController.getQuestion);

// Aptitude Questions
router.get('/aptitude/all', questionController.getAptitudeQuestions);
router.get('/aptitude/:id', questionController.getAptitudeQuestion);
router.post('/aptitude/submit', auth, questionController.submitAptitudeAnswer);

module.exports = router;
