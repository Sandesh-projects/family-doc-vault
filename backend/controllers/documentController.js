// backend/controllers/documentController.js
const Document = require('../models/Document'); // Import Document model
const User = require('../models/User'); // Import User model (needed for sharing logic)
const { logger } = require('../utils/logger'); // Import logger
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler utility
const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse class
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module
const mongoose = require('mongoose');

// Define the directory where files are stored (must match Multer config)
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private (User must be authenticated)
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  console.log('--- Upload Request Received ---');
  console.log('req.file:', req.file); // This should contain file info if Multer worked
  console.log('req.body:', req.body); // This should contain documentType, description etc.
  console.log('--- End Upload Request ---');
  // Multer middleware (defined in routes) processes the file and populates req.file
  if (!req.file) {
    logger.warn(`Document upload failed: No file received for user ${req.user._id}`);
    return next(new ErrorResponse('No file uploaded', 400));
  }

  // Extract document metadata from request body
  const { documentType, description } = req.body;

  if (!documentType) {
      // If metadata is missing but file was uploaded, potentially clean up the file
      fs.unlink(req.file.path, (err) => {
          if (err) logger.error(`Error cleaning up uploaded file ${req.file.path}: ${err.message}`);
      });
      logger.warn(`Document upload failed: Missing document type for user ${req.user._id}`);
      return next(new ErrorResponse('Please provide a document type', 400));
  }

  // Create a new document record in the database
  const document = await Document.create({
    userId: req.user._id, // Get user ID from the authenticated user (via protect middleware)
    fileName: req.file.originalname, // Original name from the client
    filePath: req.file.path, // Path where Multer saved the file
    fileMimeType: req.file.mimetype, // MIME type from Multer
    fileSize: req.file.size, // File size from Multer
    documentType,
    description,
  });

  logger.info(`Document uploaded successfully: "${document.fileName}" by user ${req.user._id}`);

  // Respond with the created document details (excluding sensitive file path in final output?)
  // For now, we include the path, but consider if this should be hidden from frontend.
  res.status(201).json({
    success: true,
    data: document,
  });
});

// @desc    Get all documents for the authenticated user (owned and potentially shared)
// @route   GET /api/documents
// @access  Private
// Query params: ?shared=true (get docs shared with me), ?owned=true (get docs owned by me)
exports.getDocuments = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Authenticated user ID

  let query = {}; // Build the query object

  // Check query parameters to filter documents
  const showShared = req.query.shared === 'true';
  const showOwned = req.query.owned === 'true'; // Added explicit owned filter

  if (showShared && showOwned) {
      // If both are true, get documents owned by the user OR shared with the user
      query.$or = [{ userId: userId }, { sharedWith: userId }];
      logger.debug(`Workspaceing owned OR shared documents for user ${userId}`);
  } else if (showShared) {
      // Get documents shared with the user
      query.sharedWith = userId;
       logger.debug(`Workspaceing documents shared WITH user ${userId}`);
  } else if (showOwned || (!showShared && !showOwned)) {
      // Default or if owned=true: Get documents owned by the user
      query.userId = userId;
      logger.debug(`Workspaceing documents OWNED by user ${userId}`);
  } else {
       // Should not happen with the above logic, but handle explicitly
       query.userId = userId; // Default to owned
       logger.debug(`Workspaceing documents (default - owned) for user ${userId}`);
  }


  // --- Implement Pagination and Sorting (as per optimization focus) ---
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 documents per page
  const skip = (page - 1) * limit; // Calculate number of documents to skip

  // Basic sorting (e.g., newest first)
  const sortBy = req.query.sortBy || 'createdAt'; // Default sort field
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // 1 for asc, -1 for desc

  const totalDocuments = await Document.countDocuments(query); // Get total count for pagination info
  const documents = await Document.find(query)
    .sort({ [sortBy]: sortOrder }) // Apply sorting
    .skip(skip) // Apply skip for pagination
    .limit(limit); // Apply limit for pagination


  logger.info(`Workspaceed ${documents.length} documents for user ${userId} (Total: ${totalDocuments})`);

  res.status(200).json({
    success: true,
    count: documents.length,
    total: totalDocuments, // Total documents matching the query
    pagination: { // Pagination info
        currentPage: page,
        limit: limit,
        next: skip + limit < totalDocuments ? page + 1 : null,
        prev: page > 1 ? page - 1 : null
    },
    data: documents,
  });
});

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private (User must own or be shared with)
exports.getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    logger.warn(`Document not found with ID ${req.params.id} for user ${req.user._id}`);
    return next(new ErrorResponse(`Document not found with ID of ${req.params.id}`, 404));
  }

  // Check if the user owns the document OR is in the sharedWith list
  const isOwner = document.userId.toString() === req.user._id.toString();
  const isSharedWith = document.sharedWith.includes(req.user._id);

  if (!isOwner && !isSharedWith) {
    logger.warn(`Access denied to document ${req.params.id} for user ${req.user._id} (Not owner or shared with)`);
    return next(new ErrorResponse('Not authorized to access this document', 403)); // 403 Forbidden
  }

  logger.info(`Document retrieved successfully: "${document.fileName}" (ID: ${document._id}) by user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: document,
  });
});

// @desc    Download a single document by ID
// @route   GET /api/documents/:id/download
// @access  Private (User must own or be shared with)
exports.downloadDocument = asyncHandler(async (req, res, next) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        logger.warn(`Download failed: Document not found with ID ${req.params.id} for user ${req.user._id}`);
        return next(new ErrorResponse(`Document not found with ID of ${req.params.id}`, 404));
    }

    // Check if the user owns the document OR is in the sharedWith list
    const isOwner = document.userId.toString() === req.user._id.toString();
    const isSharedWith = document.sharedWith.includes(req.user._id);

    if (!isOwner && !isSharedWith) {
        logger.warn(`Download access denied to document ${req.params.id} for user ${req.user._id} (Not owner or shared with)`);
        return next(new ErrorResponse('Not authorized to download this document', 403)); // 403 Forbidden
    }

    const filePath = document.filePath;
    const fileName = document.fileName; // Use the stored filename for download

    // Check if the file exists on the filesystem
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
             logger.error(`Download failed: File not found on filesystem for document ${document._id} at path ${filePath}. Error: ${err ? err.message : 'Not a file'}`);
             // If DB record exists but file is gone, consider cleaning up the DB record here in a real app
             return next(new ErrorResponse('File not found on the server', 500)); // 500 Internal Server Error or 404 Not Found? Let's go with 500 as DB says it exists.
        }

        // Use res.download to send the file
        // This sets Content-Disposition and Content-Type headers correctly
        logger.info(`Initiating download for document "${document.fileName}" (ID: ${document._id}) by user ${req.user._id}`);
        res.download(filePath, fileName, (downloadErr) => {
            if (downloadErr) {
                // Handle potential errors during the download stream
                logger.error(`Error during download stream for document ${document._id}: ${downloadErr.message}`);
                 // Check if headers were already sent, happens if connection was interrupted
                if (!res.headersSent) {
                     return next(new ErrorResponse('Error downloading file', 500));
                }
                // If headers were sent, the connection was likely closed by the client,
                // so just log and don't try to send another response.
            } else {
                 logger.info(`Download completed successfully for document "${document.fileName}" (ID: ${document._id}) by user ${req.user._id}`);
            }
        });
    });
});


// @desc    Update document details (metadata only)
// @route   PUT /api/documents/:id
// @access  Private (User must own)
exports.updateDocument = asyncHandler(async (req, res, next) => {
    // Note: File content is NOT updated here. This is for metadata.

    let document = await Document.findById(req.params.id);

    if (!document) {
        logger.warn(`Update failed: Document not found with ID ${req.params.id} for user ${req.user._id}`);
        return next(new ErrorResponse(`Document not found with ID of ${req.params.id}`, 404));
    }

    // Check if user is the owner
    if (document.userId.toString() !== req.user._id.toString()) {
        logger.warn(`Update access denied to document ${req.params.id} for user ${req.user._id} (Not owner)`);
        return next(new ErrorResponse('Not authorized to update this document', 403)); // 403 Forbidden
    }

    // Extract allowed fields to update from req.body
    const { documentType, description } = req.body;

    // Update the document metadata
    // Using findByIdAndUpdate with { new: true } returns the updated document
    document = await Document.findByIdAndUpdate(req.params.id, {
        documentType,
        description
    }, {
        new: true, // Return the modified document rather than the original
        runValidators: true, // Run Mongoose schema validators on update
    });

    logger.info(`Document updated successfully: "${document.fileName}" (ID: ${document._id}) by user ${req.user._id}`);

    res.status(200).json({
        success: true,
        data: document,
    });
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (User must own)
exports.deleteDocument = asyncHandler(async (req, res, next) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        logger.warn(`Delete failed: Document not found with ID ${req.params.id} for user ${req.user._id}`);
        return next(new ErrorResponse(`Document not found with ID of ${req.params.id}`, 404));
    }

    // Check if user is the owner
    if (document.userId.toString() !== req.user._id.toString()) {
        logger.warn(`Delete access denied to document ${req.params.id} for user ${req.user._id} (Not owner)`);
        return next(new ErrorResponse('Not authorized to delete this document', 403)); // 403 Forbidden
    }

    const filePath = document.filePath; // Get file path before deleting the DB record

    // Delete the document record from the database
    await Document.findByIdAndDelete(req.params.id);

    // Delete the actual file from the filesystem
    fs.unlink(filePath, (err) => {
        if (err) {
             // Log the error, but don't necessarily fail the API request
             // The DB record is gone, which is the primary goal.
             logger.error(`Error deleting file from filesystem for document ${document._id} at path ${filePath}: ${err.message}`);
             // In a real app, you might have a cleanup process that periodically checks for orphaned files
        } else {
            logger.info(`File deleted from filesystem: ${filePath}`);
        }
    });

    logger.info(`Document deleted successfully: "${document.fileName}" (ID: ${document._id}) by user ${req.user._id}`);

    // Respond with a success message or status
    res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {} // Or the deleted document ID
    });
});

// @desc    Share a document with family members
// @route   POST /api/documents/:id/share
// @access  Private (User must own)
exports.shareDocument = asyncHandler(async (req, res, next) => {
    const documentId = req.params.id;
    const userId = req.user._id; // The owner/sharer
    const { familyMemberIds } = req.body; // Array of user IDs to share with

    // Validate input: familyMemberIds should be an array of strings/ObjectIds
    if (!Array.isArray(familyMemberIds) || familyMemberIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        logger.warn(`Share failed: Invalid familyMemberIds provided for document ${documentId} by user ${userId}`);
        return next(new ErrorResponse('Invalid family member IDs provided', 400));
    }

    let document = await Document.findById(documentId);

    if (!document) {
        logger.warn(`Share failed: Document not found with ID ${documentId} for user ${userId}`);
        return next(new ErrorResponse(`Document not found with ID of ${documentId}`, 404));
    }

    // Check if user is the owner
    if (document.userId.toString() !== userId.toString()) {
        logger.warn(`Share access denied to document ${documentId} for user ${userId} (Not owner)`);
        return next(new ErrorResponse('Not authorized to share this document', 403)); // 403 Forbidden
    }

    // --- Validation: Ensure provided IDs are actual family members of the owner ---
    const ownerUser = await User.findById(userId).select('familyMembers'); // Fetch owner user to check family members
    if (!ownerUser) {
         // This should ideally not happen if protect middleware works, but double check
         logger.error(`Critical Error: Owner user ${userId} not found during share operation for document ${documentId}`);
         return next(new ErrorResponse('Owner user not found', 500)); // Server error
    }

    // Filter the provided familyMemberIds to ensure they are valid family members of the owner
    const validFamilyMemberIds = familyMemberIds.filter(id =>
        ownerUser.familyMembers.map(memberId => memberId.toString()).includes(id.toString())
    );

    // Log if any provided IDs were not valid family members
    if (validFamilyMemberIds.length !== familyMemberIds.length) {
         const invalidIds = familyMemberIds.filter(id =>
             !ownerUser.familyMembers.map(memberId => memberId.toString()).includes(id.toString())
         );
         logger.warn(`Share operation for document ${documentId} by user ${userId}: Some provided IDs were not valid family members: ${invalidIds.join(', ')}`);
         // Decide if you want to return an error or just proceed with valid ones.
         // Proceeding with valid ones is often more user-friendly.
    }


    // --- Update sharedWith array ---
    // Use $addToSet to add new member IDs without creating duplicates
    document = await Document.findByIdAndUpdate(documentId, {
        $addToSet: { sharedWith: { $each: validFamilyMemberIds } } // Add each valid ID to sharedWith array
    }, {
        new: true, // Return the modified document
        runValidators: false // No schema validation needed for $addToSet operation
    });

    logger.info(`Document "${document.fileName}" (ID: ${document._id}) shared by user ${userId} with ${validFamilyMemberIds.length} family members`);

    res.status(200).json({
        success: true,
        data: document, // Return the updated document
    });
});