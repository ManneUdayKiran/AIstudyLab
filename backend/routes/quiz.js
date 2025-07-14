const express = require('express');
const router = express.Router();
const { getQuizQuestions, submitQuizAnswers } = require('../controllers/quizController');

router.get('/', getQuizQuestions);
router.post('/submit', submitQuizAnswers);

module.exports = router; 