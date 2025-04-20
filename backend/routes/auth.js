// backend/routes/auth.js
const express = require('express');
const router = express.Router(); // Create an Express router instance
const { registerUser, loginUser, /* getMe */ } = require('../controllers/authController'); // Import functions from auth controller
// const { protect } = require('../middleware/authMiddleware'); // We'll add protect middleware later if needed for auth routes

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Get logged in user profile (optional, can be done in user routes too)
// @route   GET /api/auth/me
// @access  Private
// router.get('/me', protect, getMe); // Uncomment when protect middleware and getMe controller are ready

module.exports = router;