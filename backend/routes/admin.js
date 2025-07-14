const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, updateQuestion, deleteQuestion, addSampleQuestions } = require('../controllers/adminController');

// GET all questions
router.get('/questions', getQuestions);
// POST add a question
router.post('/questions', addQuestion);
// PUT update a question
router.put('/questions/:id', updateQuestion);
// DELETE remove a question
router.delete('/questions/:id', deleteQuestion);
// Utility: Add sample questions
router.post('/add-sample-questions', addSampleQuestions);

module.exports = router; 