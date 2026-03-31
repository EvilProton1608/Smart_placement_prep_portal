const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Coding Questions
router.get('/', questionController.getAllQuestions);
router.get('/coding/:id', questionController.getQuestion);

// Aptitude Questions
router.get('/aptitude/all', questionController.getAptitudeQuestions);
router.get('/aptitude/:id', questionController.getAptitudeQuestion);
router.post('/aptitude/submit', questionController.submitAptitudeAnswer);

module.exports = router;
