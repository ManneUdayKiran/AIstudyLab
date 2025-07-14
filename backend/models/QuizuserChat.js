const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const quizuserChatSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  messages: [messageSchema]
});

module.exports = mongoose.model('QuizuserChat', quizuserChatSchema); 