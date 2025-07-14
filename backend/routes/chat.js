const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory, clearChatHistory } = require('../controllers/chatController');

router.post('/', chatWithAI);
router.get('/history', getChatHistory);
router.post('/clear', clearChatHistory);

module.exports = router; 