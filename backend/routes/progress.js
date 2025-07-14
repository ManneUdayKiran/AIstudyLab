const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// Get weekly progress
router.get('/weekly', auth, progressController.getWeeklyProgress);

// Record progress
router.post('/record', auth, progressController.recordProgress);

// Get progress summary
router.get('/summary', auth, progressController.getProgressSummary);

// Get detailed question progress for a subject
router.get('/questions', auth, progressController.getQuestionProgress);

// Get saved quiz progress for a subject
router.get('/quiz-progress', auth, progressController.getSavedQuizProgress);

module.exports = router; 