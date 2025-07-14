const jwt = require('jsonwebtoken');
const Quizuser = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Auth middleware - Decoded token:', decoded);
    
    // Try different possible user ID fields
    const userId = decoded.id || decoded._id || decoded.userId;
    console.log('Auth middleware - User ID from token:', userId);
    
    if (!userId) {
      console.log('Auth middleware - No user ID found in token');
      return res.status(401).json({ message: 'Token is not valid - no user ID' });
    }
    
    const user = await Quizuser.findById(userId);
    console.log('Auth middleware - User found:', user ? 'Yes' : 'No', user ? `ID: ${user._id}` : '');
    
    if (!user) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    req.user = user;
    console.log('Auth middleware - User attached to request:', req.user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
