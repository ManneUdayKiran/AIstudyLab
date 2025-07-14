const mongoose = require('mongoose');

const DataScienceLearningSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Answer: { type: String, required: true }
});

module.exports = mongoose.model('DataScienceLearning', DataScienceLearningSchema); 