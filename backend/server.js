// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { logger } = require('./utils/logger'); // Import logger
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const cors = require('cors'); // Import cors for development

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
// Use cors for development to allow requests from your frontend origin
// In production, you might want to configure this more restrictively
app.use(cors());

// Body parser middleware to handle JSON and urlencoded data
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// Serve static files if needed (e.g., uploaded documents - though streaming is better)
// For serving uploaded files directly (less secure, consider streaming in production):
// app.use('/uploads', express.static('uploads')); // Assuming files are stored in a 'uploads' folder

// Error handling middleware
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set in .env

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1)); // Uncomment if you want to exit on unhandled rejection
});