// backend/utils/errorResponse.js

// Custom error class that extends the built-in Error class
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Call the parent constructor with the error message
    super(message);

    // Attach a status code property to the error instance
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;