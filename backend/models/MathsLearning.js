const mongoose = require('mongoose');

const MathsLearningSchema = new mongoose.Schema({
  instruction: { type: String, required: true },
  response: { type: String, required: true }
});

module.exports = mongoose.model('MathsLearning', MathsLearningSchema); 