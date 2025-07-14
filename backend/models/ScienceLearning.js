const mongoose = require('mongoose');

const ScienceLearningSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Answer: { type: String, required: true },
  Context: { type: String }
});

module.exports = mongoose.model('ScienceLearning', ScienceLearningSchema); 