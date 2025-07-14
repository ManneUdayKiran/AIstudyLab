const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dailyProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  studyTime: {
    type: Number, // in minutes
    default: 0
  },
  subjectsStudied: [{
    type: String
  }],
  achievements: [{
    type: String
  }],
  score: {
    type: Number,
    default: 0
  },
  questionDetails: {
    questionIndex: Number,
    isCorrect: Boolean,
    subject: String,
    timestamp: Date,
    selectedAnswer: String,
    correctAnswer: String,
    explanation: String
  }
}, {
  timestamps: true
});

// Index for efficient querying (removed unique constraint to allow multiple entries per day)
progressSchema.index({ userId: 1, date: 1 });
progressSchema.index({ userId: 1, 'questionDetails.subject': 1 });

module.exports = mongoose.model('Progress', progressSchema); 