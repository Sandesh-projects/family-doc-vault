// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const asyncHandler = require('./asyncHandler'); // Import the asyncHandler utility
const ErrorResponse = require('../utils/errorResponse'); // Import the custom error class
const User = require('../models/User'); // Import the User model
const { logger } = require('../utils/logger'); // Import logger

// Middleware to protect routes - checks for JWT and attaches user to request
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in the 'Authorization' header (Bearer Token)
  // Example: Authorization: 'Bearer TOKENSTRING'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token string (remove 'Bearer ')
    token = req.headers.authorization.split(' ')[1];
  }
  // You could also check for a token in a cookie if you chose that method in sendTokenResponse
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // If no token is found, deny access
  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return next(new ErrorResponse('Not authorized to access this route (No token)', 401)); // 401 Unauthorized
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // logger.debug(`Token decoded: ${JSON.stringify(decoded)}`); // Log decoded payload for debugging

    // Find the user based on the decoded user ID (id field from token payload)
    // Select '-' prefix means exclude that field (e.g., exclude password, __v)
    const user = await User.findById(decoded.id).select('-password -__v');

    if (!user) {
      logger.warn(`Authentication failed: User not found for token payload ID ${decoded.id}`);
      return next(new ErrorResponse('Not authorized to access this route (User not found)', 401));
    }

    // Attach the fetched user document to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();

  } catch (error) {
      // If token verification fails (invalid signature, expired, etc.)
      logger.warn(`Authentication failed: Token verification error - ${error.message}`);
      return next(new ErrorResponse('Not authorized to access this route (Invalid token)', 401));
  }
});

// --- Optional: Middleware for role-based access control ---
// exports.authorize = (...roles) => { // Example: authorize('admin', 'publisher')
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) { // Assuming user model has a 'role' field
//       return next(
//         new ErrorResponse(
//           `User role ${req.user.role} is not authorized to access this route`,
//           403 // Forbidden
//         )
//       );
//     }
//     next();
//   };
// };