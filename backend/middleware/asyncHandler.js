// backend/middleware/asyncHandler.js

// Higher-order function that takes an async function (controller)
// and returns a new function that handles potential errors by
// passing them to the Express error handling middleware (next).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;