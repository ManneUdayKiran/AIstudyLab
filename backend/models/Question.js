const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true, default: 'Computer Science' },
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  answer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
  explanation: { type: String },
  category: { type: String, default: 'Computer Science' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema); 


