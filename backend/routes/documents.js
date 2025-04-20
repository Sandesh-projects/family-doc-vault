// backend/routes/documents.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const path = require('path');
const { logger } = require('../utils/logger');

// --- Multer Setup for File Uploads ---
// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    // Ensure this directory exists! Create backend/uploads if it doesn't.
    // console.log('Multer Destination:', path.join(__dirname, '../uploads')); // Optional: log destination path
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  // Temporarily remove limits and fileFilter for debugging
  // limits: { fileSize: 1024 * 1024 * 10 },
  // fileFilter: function(req, file, cb) {
  //   const filetypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  //   const mimetype = filetypes.test(file.mimetype);
  //   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //   if (mimetype && extname) { return cb(null, true); }
  //   else { cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.')); }
  // }
});

// --- Document Management Routes ---

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
router.post('/',
    (req, res, next) => { // <-- Debug log 1: Before protect/multer
        console.log('--- POST /api/documents route hit ---');
        next();
    },
    protect, // Authentication middleware
    upload.single('document'), // Multer middleware
    (req, res, next) => { // <-- Debug log 2: After Multer
        console.log('--- After Multer ---');
        console.log('req.file AFTER Multer:', req.file); // <-- Check this output
        console.log('req.body AFTER Multer:', req.body); // <-- Check this output
        console.log('--- End After Multer ---');
        next();
    },
    documentController.uploadDocument // Controller function (contains Debug log 3)
);

// @desc    Get all documents for the authenticated user (and potentially shared with them)
// @route   GET /api/documents
// @access  Private
// Query parameters like ?shared=true can be used to filter
router.get('/', protect, documentController.getDocuments);

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private (User must own or be shared with)
router.get('/:id', protect, documentController.getDocument);

// @desc    Download a single document by ID
// @route   GET /api/documents/:id/download
// @access  Private (User must own or be shared with)
router.get('/:id/download', protect, documentController.downloadDocument);


// @desc    Update document details (metadata)
// @route   PUT /api/documents/:id
// @access  Private (User must own)
// Note: File content is typically not updated via PUT on the same ID.
// A new version would usually be uploaded. This PUT is for metadata.
router.put('/:id', protect, documentController.updateDocument);

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (User must own)
router.delete('/:id', protect, documentController.deleteDocument);


// --- Document Sharing Routes ---

// @desc    Share a document with family members
// @route   POST /api/documents/:id/share
// @access  Private (User must own)
router.post('/:id/share', protect, documentController.shareDocument);

// Note: There isn't a specific route just for "shared with me".
// The GET /api/documents route will handle filtering based on query parameters
// in the controller logic.

module.exports = router;
