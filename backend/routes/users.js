// backend/routes/users.js
const express = require('express');
const router = express.Router(); // Create an Express router instance
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const userController = require('../controllers/userController'); // Import user controller functions

// --- User Profile Routes ---

// @desc    Get the profile of the currently logged-in user
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, userController.getMe);

// @desc    Update the profile of the currently logged-in user
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, userController.updateMe);

// @desc    Get a user profile by ID (can be self or a linked family member)
// @route   GET /api/users/:id
// @access  Private (User must be the requested ID or a linked family member)
// This route needs careful access control in the controller.
router.get('/:id', protect, userController.getUserById);

// --- Family Management Routes (Applied to the currently logged-in user's profile) ---

// @desc    Link a family member to the current user's profile
// @route   POST /api/users/me/family
// @access  Private
router.post('/me/family', protect, userController.addFamilyMember);

// @desc    Unlink a family member from the current user's profile
// @route   DELETE /api/users/me/family/:memberId
// @access  Private
router.delete('/me/family/:memberId', protect, userController.removeFamilyMember);


// Note: There isn't a specific route just for listing family members.
// The family members list is available within the user profile object retrieved by GET /api/users/me or GET /api/users/:id

module.exports = router;