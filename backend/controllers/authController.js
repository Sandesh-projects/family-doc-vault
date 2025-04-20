// backend/controllers/authController.js
const User = require('../models/User'); // Import the User model
const { logger } = require('../utils/logger'); // Import logger
const asyncHandler = require('../middleware/asyncHandler'); // We'll create this utility for cleaner async handling
const ErrorResponse = require('../utils/errorResponse'); // We'll create this custom error class

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, aadhaarNumber } = req.body;

  // Basic validation (more detailed validation can be added later or with libraries like Joi/Express-validator)
  if (!name || !email || !password) {
      logger.warn(`Registration failed: Missing credentials for email ${email}`);
      return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  // Check if user already exists by email
  const userExistsByEmail = await User.findOne({ email });
  if (userExistsByEmail) {
      logger.warn(`Registration failed: Email already exists for ${email}`);
      return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Check if user already exists by Aadhaar Number if provided
  if (aadhaarNumber) {
      const userExistsByAadhaar = await User.findOne({ aadhaarNumber });
      if (userExistsByAadhaar) {
          logger.warn(`Registration failed: Aadhaar number already exists for ${aadhaarNumber}`);
          return next(new ErrorResponse('User already exists with this Aadhaar number', 400));
      }
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    aadhaarNumber // This will be added if provided, otherwise it will be null/undefined as per schema
  });

  // Log successful registration
  logger.info(`User registered successfully: ${user.email} (ID: ${user._id})`);

  // Respond with token (and potentially user data)
  sendTokenResponse(user, 201, res);
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    logger.warn(`Login failed: Missing email or password`);
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user by email, explicitly select the password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    logger.warn(`Login failed: Invalid credentials for email ${email}`);
    return next(new ErrorResponse('Invalid credentials', 401)); // Use 401 for unauthorized
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    logger.warn(`Login failed: Invalid password for email ${email}`);
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Log successful login
  logger.info(`User logged in successfully: ${user.email} (ID: ${user._id})`);

  // Respond with token
  sendTokenResponse(user, 200, res);
});


// Helper function to send JWT token in response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Options for cookie (if you decide to use cookies)
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // Convert days to milliseconds
    httpOnly: true // Makes the cookie inaccessible to browser JavaScript
  };

  // In production, you might want to add 'secure: true' for HTTPS
  // if (process.env.NODE_ENV === 'production') {
  //   options.secure = true;
  // }

  // You can send the token in a cookie or directly in the JSON response body.
  // For a pure API consumed by a frontend, sending in the JSON body is common.
  res.status(statusCode).json({
    success: true,
    token: token,
    // Optionally send user data (exclude password)
    user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        aadhaarNumber: user.aadhaarNumber,
        familyMembers: user.familyMembers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
  });

  // If using cookies:
  // res.status(statusCode).cookie('token', token, options).json({
  //   success: true,
  //   token: token // Optional: send token in body too, or just in cookie
  // });
};


// --- Placeholder for future implementation ---
// // @desc    Get current logged in user
// // @route   GET /api/auth/me
// // @access  Private
// exports.getMe = asyncHandler(async (req, res, next) => {
//     const user = req.user; // User is available from the protect middleware (req.user)

//     res.status(200).json({
//         success: true,
//         data: user
//     });
// });