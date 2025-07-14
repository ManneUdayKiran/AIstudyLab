const mongoose = require('mongoose');

const mathQuestionSchema = new mongoose.Schema({
  Problem: { type: String, required: true },
  Rationale: { type: String },
  options: { type: String }, // Store as a single string, can be split on ',' or parsed as needed
  correct: { type: String },
  annotated_formula: { type: String },
  linear_formula: { type: String },
  category: { type: String, default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('MathQuestion', mathQuestionSchema); 