// backend/config/db.js
const mongoose = require('mongoose');
const { logger } = require('../utils/logger'); // Import logger

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6.x and later have these options as default,
      // but explicitly including them can be helpful for clarity or older versions.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // No longer supported in Mongoose 6+
      // useFindAndModify: false // No longer supported in Mongoose 6+
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;