const express = require('express');
const router = express.Router();
const { 
  importQuestionsFromFile, 
  importQuestionsFromJSON, 
  importQuestionsFromFilePath,
  getImportStats,
  getMathQuestions,
  getBooks,
  getAllLearning,
  getAllMathsLearning,
  getAllDataScienceLearning,
  getAllScienceLearning
} = require('../controllers/dataImportController');

// Import questions from uploaded CSV file
router.post('/questions/file', importQuestionsFromFile);

// Import questions from JSON data (for Postman)
router.post('/questions/json', importQuestionsFromJSON);

// Import questions from JSON file path
router.post('/questions/filepath', importQuestionsFromFilePath);

// Get import statistics
router.get('/stats', getImportStats);

// Get math/science/history questions
router.get('/math-questions', getMathQuestions);

// Get paginated list of books
router.get('/books', getBooks);

// Get all learning documents
router.get('/learning', getAllLearning);

// Get all maths learning documents
router.get('/maths-learning', getAllMathsLearning);

// Get all data science learning documents
router.get('/datascience-learning', getAllDataScienceLearning);

// Get all science learning documents
router.get('/science-learning', getAllScienceLearning);

module.exports = router; 