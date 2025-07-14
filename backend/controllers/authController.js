const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Quizuser = require('../models/User');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const existing = await Quizuser.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new Quizuser({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Quizuser.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '24h' } // Extended to 24 hours
    );
    
    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      grade: user.grade,
      currentFocus: user.currentFocus,
      dailyStudyTime: user.dailyStudyTime,
      mood: user.mood,
      isOnboarded: user.isOnboarded
    };
    
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token without checking expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret', { ignoreExpiration: true });
    
    // Check if user still exists
    const user = await Quizuser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      grade: user.grade,
      currentFocus: user.currentFocus,
      dailyStudyTime: user.dailyStudyTime,
      mood: user.mood,
      isOnboarded: user.isOnboarded
    };
    
    res.json({ token: newToken, user: userData });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Update user profile (onboarding)
exports.updateProfile = async (req, res) => {
  try {
    console.log('UpdateProfile - Request body:', req.body);
    console.log('UpdateProfile - User from request:', req.user);
    
    const { avatar, grade, currentFocus, dailyStudyTime, mood } = req.body;
    const userId = req.user._id; // Use the user ID from the authenticated request

    console.log('UpdateProfile - User ID to update:', userId);

    const updatedUser = await Quizuser.findByIdAndUpdate(
      userId,
      {
        avatar,
        grade,
        currentFocus,
        dailyStudyTime,
        mood,
        isOnboarded: true
      },
      { new: true, select: '-password' }
    );

    console.log('UpdateProfile - Updated user result:', updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 