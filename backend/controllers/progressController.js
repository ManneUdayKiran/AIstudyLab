const Progress = require('../models/Progress');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get user's weekly progress
const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get the start of the current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get the end of the current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Fetch progress for the current week
    const weeklyProgress = await Progress.find({
      userId: userId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).sort({ date: 1 });
    
    // Create a map of days with default values
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const progressMap = {};
    
    daysOfWeek.forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateKey = date.toISOString().split('T')[0];
      progressMap[dateKey] = {
        day: day,
        date: date,
        progress: 0,
        quizzesCompleted: 0,
        studyTime: 0,
        subjectsStudied: []
      };
    });
    
    // Fill in actual progress data
    weeklyProgress.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (progressMap[dateKey]) {
        progressMap[dateKey].progress = entry.dailyProgress;
        progressMap[dateKey].quizzesCompleted = entry.quizzesCompleted;
        progressMap[dateKey].studyTime = entry.studyTime;
        progressMap[dateKey].subjectsStudied = entry.subjectsStudied;
      }
    });
    
    // Convert to array and calculate cumulative progress
    const progressArray = Object.values(progressMap);
    let cumulativeProgress = 0;
    
    progressArray.forEach((day, index) => {
      if (day.progress > 0) {
        cumulativeProgress += day.progress;
      }
      day.cumulativeProgress = Math.min(cumulativeProgress, 100);
    });
    
    res.json({
      success: true,
      data: progressArray,
      totalProgress: cumulativeProgress,
      weekStart: startOfWeek,
      weekEnd: endOfWeek
    });
    
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress data'
    });
  }
};

// Record user progress
const recordProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      dailyProgress, 
      quizzesCompleted, 
      studyTime, 
      subjectsStudied, 
      achievements, 
      score,
      questionDetails
    } = req.body;
    
    // Create a new progress entry for each question
    const progress = new Progress({
      userId: userId,
      date: new Date(),
      dailyProgress: dailyProgress || 0,
      quizzesCompleted: quizzesCompleted || 1,
      studyTime: studyTime || 5,
      subjectsStudied: subjectsStudied || [],
      achievements: achievements || [],
      score: score || 0,
      questionDetails: questionDetails ? {
        questionIndex: questionDetails.questionIndex,
        isCorrect: questionDetails.isCorrect,
        subject: questionDetails.subject,
        timestamp: questionDetails.timestamp,
        selectedAnswer: questionDetails.selectedAnswer || '',
        correctAnswer: questionDetails.correctAnswer || '',
        explanation: questionDetails.explanation || ''
      } : undefined
    });
    
    await progress.save();
    
    res.json({
      success: true,
      message: 'Progress recorded successfully',
      data: progress
    });
    
  } catch (error) {
    console.error('Error recording progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record progress'
    });
  }
};

// Get user's overall progress summary
const getProgressSummary = async (req, res) => {
  try {
    console.log('Progress Summary - Request user:', req.user);
    console.log('Progress Summary - User ID:', req.user._id);
    console.log('Progress Summary - User ID type:', typeof req.user._id);
    console.log('Progress Summary - User ID constructor:', req.user._id.constructor.name);
    
    const userId = req.user._id;
    
    // Get overall stats
    const totalQuizzes = await Progress.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$quizzesCompleted' } } }
    ]);
    
    console.log('Progress Summary - Total quizzes result:', totalQuizzes);
    
    const totalStudyTime = await Progress.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$studyTime' } } }
    ]);
    
    console.log('Progress Summary - Total study time result:', totalStudyTime);
    
    const uniqueSubjects = await Progress.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$subjectsStudied' },
      { $group: { _id: '$subjectsStudied' } },
      { $count: 'total' }
    ]);
    
    console.log('Progress Summary - Unique subjects result:', uniqueSubjects);
    
    const averageScore = await Progress.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, average: { $avg: '$score' } } }
    ]);
    
    console.log('Progress Summary - Average score result:', averageScore);
    
    res.json({
      success: true,
      data: {
        totalQuizzes: totalQuizzes[0]?.total || 0,
        totalStudyTime: totalStudyTime[0]?.total || 0, // in minutes
        subjectsStudied: uniqueSubjects[0]?.total || 0,
        averageScore: Math.round(averageScore[0]?.average || 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress summary'
    });
  }
};

// Get detailed question progress for a subject
const getQuestionProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject } = req.query;
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject parameter is required'
      });
    }
    
    // Get all progress entries with question details for the subject
    const progressEntries = await Progress.find({
      userId: userId,
      'questionDetails.subject': subject
    }).sort({ 'questionDetails.timestamp': -1 });
    
    // Process the data
    const questionProgress = progressEntries.map(entry => ({
      questionIndex: entry.questionDetails?.questionIndex,
      isCorrect: entry.questionDetails?.isCorrect,
      timestamp: entry.questionDetails?.timestamp,
      score: entry.score
    }));
    
    res.json({
      success: true,
      data: questionProgress
    });
    
  } catch (error) {
    console.error('Error fetching question progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question progress'
    });
  }
};

// Get user's saved quiz progress for a specific subject
const getSavedQuizProgress = async (req, res) => {
  try {
    console.log('getSavedQuizProgress called with query:', req.query);
    console.log('getSavedQuizProgress user:', req.user);
    
    const userId = req.user?._id;
    const { subject } = req.query;
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject parameter is required'
      });
    }
    
    // Get all progress entries with question details for the subject
    const progressEntries = await Progress.find({
      userId: userId,
      'questionDetails.subject': subject
    }).sort({ 'questionDetails.timestamp': -1 });
    
    // Create a map of completed questions and their results
    const completedQuestions = new Set();
    const questionResults = {};
    const questionDetails = {};
    let totalScore = 0;
    
    console.log('Processing progress entries:', progressEntries.length);
    
    progressEntries.forEach(entry => {
      if (entry.questionDetails && entry.questionDetails.questionIndex !== undefined) {
        const questionIndex = entry.questionDetails.questionIndex;
        completedQuestions.add(questionIndex);
        questionResults[questionIndex] = entry.questionDetails.isCorrect;
        questionDetails[questionIndex] = {
          selectedAnswer: entry.questionDetails.selectedAnswer,
          correctAnswer: entry.questionDetails.correctAnswer,
          explanation: entry.questionDetails.explanation
        };
        console.log(`Question ${questionIndex}: isCorrect = ${entry.questionDetails.isCorrect}`);
        if (entry.questionDetails.isCorrect) {
          totalScore += 1;
        }
      }
    });
    
    console.log('Final question results:', questionResults);
    
    res.json({
      success: true,
      data: {
        completedQuestions: Array.from(completedQuestions),
        questionResults,
        questionDetails,
        totalScore,
        totalQuestions: completedQuestions.size
      }
    });
    
  } catch (error) {
    console.error('Error fetching saved quiz progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved quiz progress'
    });
  }
};

module.exports = {
  getWeeklyProgress,
  recordProgress,
  getProgressSummary,
  getQuestionProgress,
  getSavedQuizProgress
}; 