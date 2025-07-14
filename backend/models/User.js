const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // New fields for user profile
  avatar: { type: String, default: '' },
  grade: { type: String, default: '' },
  currentFocus: { type: String, default: '' },
  dailyStudyTime: { type: Number, default: 0 }, // in minutes
  mood: { type: String, default: '😊' }, // emoji for mood
  isOnboarded: { type: Boolean, default: false }, // track if user completed onboarding
}, { timestamps: true });

module.exports = mongoose.model('Quizuser', userSchema); 