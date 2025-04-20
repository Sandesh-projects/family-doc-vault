// backend/controllers/userController.js
const User = require('../models/User'); // Import User model
const { logger } = require('../utils/logger'); // Import logger
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler utility
const ErrorResponse = require('../utils/errorResponse'); // Import ErrorResponse class
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// @desc    Get the profile of the currently logged-in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // The user object is already attached to req.user by the protect middleware
  // We can select specific fields if needed, but req.user already excludes password
  const user = await User.findById(req.user._id).select('-password -__v'); // Re-fetch just to be sure and exclude __v

  if (!user) {
      // This case should ideally not happen if protect middleware is working correctly
      logger.error(`Critical Error: Authenticated user ${req.user._id} not found in getMe`);
      return next(new ErrorResponse('Authenticated user not found', 500)); // Server error
  }

  logger.info(`User profile retrieved: ${user.email} (ID: ${user._id})`);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update the profile of the currently logged-in user
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // ID of the authenticated user

  // Define fields that are allowed to be updated via this route
  // Prevent updating sensitive fields like email, password, familyMembers directly
  const allowedFields = ['name', 'aadhaarNumber'];
  const updateFields = {};

  // Populate updateFields object with allowed fields from req.body
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) { // Check if the field exists in the request body
        // Add validation here if needed beyond schema validation
        if (field === 'aadhaarNumber' && req.body.aadhaarNumber !== null && req.body.aadhaarNumber !== undefined) {
             // Basic Aadhaar format check before attempting update
             if (!/^\d{12}$/.test(req.body.aadhaarNumber)) {
                 logger.warn(`Update failed for user ${userId}: Invalid Aadhaar format provided`);
                 return next(new ErrorResponse('Invalid Aadhaar number format', 400));
             }
             // Check for duplicate Aadhaar if a new one is provided
             // This check is important here because Mongoose's unique index might not catch null/undefined duplicates on partial updates
             // However, the schema has `sparse: true` unique on aadhaarNumber, so Mongoose *should* handle non-null duplicates.
             // An extra check could be added here if paranoid:
             // const userWithSameAadhaar = await User.findOne({ aadhaarNumber: req.body.aadhaarNumber });
             // if (userWithSameAadhaar && userWithSameAadhaar._id.toString() !== userId.toString()) {
             //      logger.warn(`Update failed for user ${userId}: Aadhaar number already exists for another user`);
             //      return next(new ErrorResponse('Aadhaar number already exists', 400));
             // }
        }
        updateFields[field] = req.body[field];
    }
  });

   // If no allowed fields are present in the body, return a specific message
   if (Object.keys(updateFields).length === 0) {
       logger.warn(`Update failed for user ${userId}: No valid fields provided for update`);
       return next(new ErrorResponse('No valid fields provided for update (Allowed: name, aadhaarNumber)', 400));
   }


  // Find the user by ID and update
  // { new: true } returns the updated document
  // { runValidators: true } runs schema validators on the update operation
  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  }).select('-password -__v'); // Exclude password and __v from the response

  if (!updatedUser) {
      // This should not happen if protect middleware works
      logger.error(`Critical Error: Authenticated user ${userId} not found for updateMe`);
      return next(new ErrorResponse('Authenticated user not found for update', 500)); // Server error
  }

  logger.info(`User profile updated successfully: ${updatedUser.email} (ID: ${userId})`);

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});


// @desc    Get a user profile by ID (can be self or a linked family member)
// @route   GET /api/users/:id
// @access  Private (User must be the requested ID or a linked family member)
exports.getUserById = asyncHandler(async (req, res, next) => {
    const requestedUserId = req.params.id; // ID of the user whose profile is requested
    const currentUserId = req.user._id; // ID of the currently authenticated user

    // Validate requestedUserId format
    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
        logger.warn(`Get user by ID failed for user ${currentUserId}: Invalid user ID format ${requestedUserId}`);
        return next(new ErrorResponse(`Invalid user ID format: ${requestedUserId}`, 400));
    }

    // Check if the requested user is the current user
    const isSelf = requestedUserId.toString() === currentUserId.toString();

    // Find the current user to check their family members list
    // Select familyMembers field explicitly as it might be excluded by default selects on the User model if configured elsewhere
    const currentUser = await User.findById(currentUserId).select('familyMembers');

    if (!currentUser) {
         // This should not happen if protect middleware works
         logger.error(`Critical Error: Authenticated user ${currentUserId} not found in getUserById`);
         return next(new ErrorResponse('Authenticated user not found', 500)); // Server error
    }

    // Check if the requested user is in the current user's family members list
    const isFamilyMember = currentUser.familyMembers.map(memberId => memberId.toString()).includes(requestedUserId.toString());


    // If not self AND not a linked family member, deny access
    if (!isSelf && !isFamilyMember) {
        logger.warn(`Access denied to user profile ${requestedUserId} for user ${currentUserId} (Not self or family member)`);
        return next(new ErrorResponse('Not authorized to view this user profile', 403)); // 403 Forbidden
    }

    // If authorized, find the requested user's profile
    const requestedUser = await User.findById(requestedUserId).select('-password -__v'); // Exclude sensitive fields

    if (!requestedUser) {
        // This case might happen if the ID existed when currentUser was fetched but user was deleted since then
        logger.warn(`Requested user profile not found with ID ${requestedUserId} for user ${currentUserId}`);
        return next(new ErrorResponse(`User profile not found with ID of ${requestedUserId}`, 404));
    }

    logger.info(`User profile ${requestedUserId} retrieved by user ${currentUserId}`);

    res.status(200).json({
        success: true,
        data: requestedUser,
    });
});


// @desc    Link a family member to the current user's profile
// @route   POST /api/users/me/family
// @access  Private
exports.addFamilyMember = asyncHandler(async (req, res, next) => {
    const userId = req.user._id; // The user adding the family member
    const { identifier, identifierType } = req.body; // Identify the family member by email or aadhaarNumber

    // Validate input
    if (!identifier || !identifierType || (identifierType !== 'email' && identifierType !== 'aadhaarNumber')) {
        logger.warn(`Add family member failed for user ${userId}: Invalid identifier or identifier type provided`);
        return next(new ErrorResponse('Please provide a valid identifier (email or aadhaarNumber) and type', 400));
    }

    // Find the potential family member user
    let familyMemberToAdd;
    if (identifierType === 'email') {
        familyMemberToAdd = await User.findOne({ email: identifier.toLowerCase() });
    } else { // identifierType === 'aadhaarNumber'
         // Basic format check for Aadhaar before querying
        if (!/^\d{12}$/.test(identifier)) {
             logger.warn(`Add family member failed for user ${userId}: Invalid Aadhaar format for identifier`);
             return next(new ErrorResponse('Invalid Aadhaar number format', 400));
        }
        familyMemberToAdd = await User.findOne({ aadhaarNumber: identifier });
    }

    if (!familyMemberToAdd) {
        logger.warn(`Add family member failed for user ${userId}: User not found with identifier ${identifierType} "${identifier}"`);
        return next(new ErrorResponse('User not found with the provided identifier', 404));
    }

    const familyMemberId = familyMemberToAdd._id;

    // Prevent linking self
    if (familyMemberId.toString() === userId.toString()) {
        logger.warn(`Add family member failed for user ${userId}: Cannot link self as family member`);
        return next(new ErrorResponse('Cannot link yourself as a family member', 400));
    }

    // Find the current user
    const currentUser = await User.findById(userId);
     if (!currentUser) {
         logger.error(`Critical Error: Authenticated user ${userId} not found in addFamilyMember`);
         return next(new ErrorResponse('Authenticated user not found', 500)); // Server error
    }

    // Check if already linked
    if (currentUser.familyMembers.map(id => id.toString()).includes(familyMemberId.toString())) {
        logger.warn(`Add family member failed for user ${userId}: User ${familyMemberId} is already linked`);
        return next(new ErrorResponse('This user is already linked as a family member', 400));
    }

    // Add the family member's ID to the current user's familyMembers array
    // $addToSet ensures uniqueness
    const updatedCurrentUser = await User.findByIdAndUpdate(userId, {
        $addToSet: { familyMembers: familyMemberId }
    }, {
        new: true, // Return the updated document
        runValidators: true, // Run validators on update (might be needed if array has specific validation)
    }).select('-password -__v'); // Exclude password and __v


    // --- Optional: Create a mutual link ---
    // Add the current user's ID to the family member's familyMembers array as well
    // This creates a bidirectional link. Decide if this is required by your logic.
    // Handle potential errors if the other user is deleted concurrently
    try {
        await User.findByIdAndUpdate(familyMemberId, {
            $addToSet: { familyMembers: userId }
        }, { new: false, runValidators: true }); // new: false because we don't need the updated other user object
        logger.info(`Mutual family link created between ${userId} and ${familyMemberId}`);
    } catch (linkErr) {
        // Log but don't necessarily fail the primary request if mutual link fails
        logger.error(`Failed to create mutual family link between ${userId} and ${familyMemberId}: ${linkErr.message}`);
        // In a real application, you might want a mechanism to fix orphaned one-way links
    }


    logger.info(`User ${userId} linked user ${familyMemberId} as family member`);

    res.status(200).json({
        success: true,
        message: 'Family member linked successfully',
        data: updatedCurrentUser, // Return the updated current user profile
    });
});

// @desc    Unlink a family member from the current user's profile
// @route   DELETE /api/users/me/family/:memberId
// @access  Private
exports.removeFamilyMember = asyncHandler(async (req, res, next) => {
    const userId = req.user._id; // The user removing the family member
    const memberIdToRemove = req.params.memberId; // The ID of the family member to remove

    // Validate memberIdToRemove format
     if (!mongoose.Types.ObjectId.isValid(memberIdToRemove)) {
        logger.warn(`Remove family member failed for user ${userId}: Invalid member ID format ${memberIdToRemove}`);
        return next(new ErrorResponse(`Invalid member ID format: ${memberIdToRemove}`, 400));
    }

    // Prevent unlinking self
     if (memberIdToRemove.toString() === userId.toString()) {
        logger.warn(`Remove family member failed for user ${userId}: Cannot unlink self`);
        return next(new ErrorResponse('Cannot unlink yourself from your family', 400));
    }

    // Find the current user
     const currentUser = await User.findById(userId);
     if (!currentUser) {
         logger.error(`Critical Error: Authenticated user ${userId} not found in removeFamilyMember`);
         return next(new ErrorResponse('Authenticated user not found', 500)); // Server error
    }

    // Check if the user is actually linked as a family member
     if (!currentUser.familyMembers.map(id => id.toString()).includes(memberIdToRemove.toString())) {
         logger.warn(`Remove family member failed for user ${userId}: User ${memberIdToRemove} is not linked`);
         return next(new ErrorResponse('This user is not linked as a family member', 400));
     }


    // Remove the family member's ID from the current user's familyMembers array
    // $pull removes all instances of the value
    const updatedCurrentUser = await User.findByIdAndUpdate(userId, {
        $pull: { familyMembers: memberIdToRemove }
    }, {
        new: true, // Return the updated document
        runValidators: true,
    }).select('-password -__v'); // Exclude password and __v

    // --- Optional: Remove the mutual link ---
    // Also remove the current user's ID from the family member's familyMembers array
    try {
        await User.findByIdAndUpdate(memberIdToRemove, {
            $pull: { familyMembers: userId }
        }, { new: false, runValidators: true }); // new: false
        logger.info(`Mutual family link removed between ${userId} and ${memberIdToRemove}`);
    } catch (linkErr) {
         // Log but don't fail the primary request if mutual unlink fails
        logger.error(`Failed to remove mutual family link between ${userId} and ${memberIdToRemove}: ${linkErr.message}`);
        // Again, consider a cleanup mechanism for orphaned links
    }


    logger.info(`User ${userId} unlinked user ${memberIdToRemove} from family members`);


    res.status(200).json({
        success: true,
        message: 'Family member unlinked successfully',
        data: updatedCurrentUser, // Return the updated current user profile
    });
});