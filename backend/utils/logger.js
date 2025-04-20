// backend/utils/logger.js
const winston = require('winston');
require('winston-daily-rotate-file'); // Import for daily rotating files

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Define log colors (optional, for console)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
  winston.format.colorize({ all: true }), // Colorize output for console
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` // Format the log message
  )
);

// Define file transport format (no colors for file)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}` // Format for file
    )
  );


// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format, // Use colorized format for console
  }),

  // Daily rotating file transport for info level and above
  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log', // Log file pattern
    datePattern: 'YYYY-MM-DD', // Date format in filename
    zippedArchive: true, // Zip rotated files
    maxSize: '20m', // Max size of file before rotation
    maxFiles: '14d', // Retain logs for 14 days
    level: 'info', // Log only info level and above to this file
    format: fileFormat, // Use non-colorized format for file
  }),

  // Daily rotating file transport for error level only
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log', // Error log file pattern
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error', // Log only error level to this file
    format: fileFormat, // Use non-colorized format for file
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // Log level varies by environment
  levels: levels, // Use custom levels
  transports: transports, // Use configured transports
});

// Export the logger
module.exports = { logger };