// backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference the User model
    },
    fileName: {
      type: String,
      required: [true, 'Please provide a file name'],
      trim: true,
    },
    // filePath: This field will store the path to the file on the server's filesystem
    // or an identifier if using GridFS or a cloud storage service.
    // For local storage with Multer, this would typically be the path.
    filePath: {
      type: String,
      required: [true, 'File path is required'],
      // Ensure uniqueness if filePath represents a unique identifier like a GridFS file ID
      // unique: true // Uncomment if using a system like GridFS where identifier is unique
    },
    fileMimeType: { // Store the MIME type (e.g., 'application/pdf', 'image/jpeg')
        type: String,
        required: [true, 'File MIME type is required']
    },
    fileSize: { // Store file size in bytes
        type: Number,
        required: [true, 'File size is required']
    },
    documentType: { // Category of the document (e.g., 'Mark Sheet', 'PAN Card', 'Passport')
        type: String,
        required: [true, 'Please select a document type'],
        trim: true
    },
    description: { // Optional description for the document
        type: String,
        trim: true,
        default: ''
    },
    sharedWith: [ // Array of User IDs who have access to this document
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
      },
    ],
    // You could add other metadata fields here if needed, e.g., issueDate, expiryDate, issuer, etc.
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields (upload date)
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;