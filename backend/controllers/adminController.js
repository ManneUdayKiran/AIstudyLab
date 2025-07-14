const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addQuestion = async (req, res) => {
  const { question, options, answer, explanation } = req.body;
  if (!question || !options || !answer) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const q = new Question({ question, options, answer, explanation });
    await q.save();
    res.status(201).json({ message: 'Question added', question: q });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const q = await Question.findByIdAndUpdate(id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question updated', question: q });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const q = await Question.findByIdAndDelete(id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility: Add sample questions for testing
exports.addSampleQuestions = async (req, res) => {
  try {
    await Question.insertMany([
      {
        subject: 'Maths',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
        explanation: '2 + 2 = 4.'
      },
      {
        subject: 'Science',
        question: 'What planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        answer: 'Mars',
        explanation: 'Mars is called the Red Planet.'
      },
      {
        subject: 'English',
        question: 'Which is a noun?',
        options: ['Run', 'Apple', 'Quickly', 'Blue'],
        answer: 'Apple',
        explanation: 'Apple is a noun.'
      },
      {
        subject: 'Maths',
        question: 'What is the square root of 9?',
        options: ['1', '2', '3', '4'],
        answer: '3',
        explanation: 'The square root of 9 is 3.'
      }
    ]);
    res.json({ message: 'Sample questions added.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add sample questions.' });
  }
}; 