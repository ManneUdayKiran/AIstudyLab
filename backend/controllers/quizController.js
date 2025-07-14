const Question = require('../models/Question');

exports.getQuizQuestions = async (req, res) => {
  const { subject, category, difficulty, limit = 10 } = req.query;
  try {
    const filter = {};
    if (subject) filter.subject = subject;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const questions = await Question.find(filter)
      .limit(parseInt(limit))
      .lean();
    
    // Transform questions to include options array for frontend compatibility
    const transformedQuestions = questions.map(q => ({
      id: q._id,
      question: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      answer: q.answer, // Include the answer for validation
      subject: q.subject,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation
    }));
    
    res.json({ questions: transformedQuestions });
  } catch (err) {
    console.error('Error fetching quiz questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitQuizAnswers = async (req, res) => {
  const { answers } = req.body; // [{ id, answer }]
  
  try {
    let score = 0;
    const feedback = [];
    
    for (const answer of answers) {
      const question = await Question.findById(answer.id);
      if (!question) continue;
      
      const correct = answer.answer === question.answer;
      if (correct) score++;
      
      feedback.push({
        id: question._id,
        correct,
        correctAnswer: question.answer,
        explanation: question.explanation || 'No explanation available'
      });
    }
    
    res.json({ 
      score, 
      total: answers.length, 
      percentage: Math.round((score / answers.length) * 100),
      feedback 
    });
  } catch (err) {
    console.error('Error submitting quiz answers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          difficulties: {
            $push: '$difficulty'
          }
        }
      }
    ]);
    
    res.json({ stats });
  } catch (err) {
    console.error('Error getting question stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 