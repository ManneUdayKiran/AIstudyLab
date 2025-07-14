const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema({
  id: { type: String },
  source: { type: String },
  title: { type: String, required: true },
  text: { type: String, required: true },
  subject: { type: String, required: true }
});

module.exports = mongoose.model('Learning', LearningSchema); 