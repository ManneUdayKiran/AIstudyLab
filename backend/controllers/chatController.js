const axios = require('axios');
const QuizuserChat = require('../models/QuizuserChat');

exports.getChatHistory = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });
  try {
    let chat = await QuizuserChat.findOne({ email });
    if (!chat) chat = await QuizuserChat.create({ email, messages: [] });
    let messages = chat.messages;
    if (!messages || messages.length === 0) {
      messages = [{ sender: 'ai', text: 'Hi! I am your study assistant. How can I help you today?' }];
    }
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.chatWithAI = async (req, res) => {
  const { message, email } = req.body;
  if (!message || !email) return res.status(400).json({ message: 'Message and email are required.' });
  try {
    // Get or create chat history
    let chat = await QuizuserChat.findOne({ email });
    if (!chat) chat = await QuizuserChat.create({ email, messages: [] });
    // Add user message
    chat.messages.push({ sender: 'user', text: message });
    // Call Groq API
    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'gemma2-9b-it',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant. Always format your responses as lists with new lines. Use numbers (1., 2., 3.) or bullet points (-) for each item. Avoid paragraphs and markdown characters like "*" or "**". Keep responses concise and easy to read with proper line breaks.Every point should be in a new line.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const aiReply = groqRes.data.choices[0].message.content;
    // Add AI message
    chat.messages.push({ sender: 'ai', text: aiReply });
    await chat.save();
    res.json({ reply: aiReply });
  } catch (err) {
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

exports.clearChatHistory = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  try {
    await QuizuserChat.findOneAndUpdate(
      { email },
      { $set: { messages: [{ sender: 'ai', text: 'Hi! I am your study assistant. How can I help you today?' }] } }
    );
    res.json({ message: 'Chat history cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear chat history.' });
  }
}; 