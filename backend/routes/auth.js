const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, refreshToken } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

// Update user profile (onboarding) - protected route
router.put('/profile', auth, updateProfile);

module.exports = router; 