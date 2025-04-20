// backend/middleware/errorHandler.js
const ErrorResponse = require('../utils/errorResponse'); // Import the custom error class
const { logger } = require('../utils/logger'); // Import logger

const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Copy the error object
  error.message = err.message; // Explicitly copy the message property

  // Log the error for debugging purposes (especially in development)
  logger.error(err.stack || err); // Log stack trace if available, otherwise log the error object

  // --- Handle specific Mongoose errors ---

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404); // Not Found
  }

  // Mongoose duplicate key (e.g., trying to create a user with an existing email)
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    // You could potentially parse err.keyValue to get the specific field
    // const message = `Duplicate field value entered for ${Object.keys(err.keyValue)}`;
    error = new ErrorResponse(message, 400); // Bad Request
  }

  // Mongoose validation error (e.g., missing required field, invalid format)
  if (err.name === 'ValidationError') {
    // Extract error messages from the validation errors object
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join(', '); // Join multiple validation messages
    error = new ErrorResponse(message, 400); // Bad Request
  }

  // --- Handle our custom ErrorResponse ---
  // If the error is already an instance of our custom ErrorResponse, use its properties
  if (err instanceof ErrorResponse) {
      error = err; // Use the existing ErrorResponse
  }


  // --- Final response ---
  // Set the status code and send the response
  res.status(error.statusCode || 500).json({
    success: false, // Indicate failure
    error: error.message || 'Server Error', // Provide error message (use generic for unhandled 500s)
  });
};

module.exports = { errorHandler };