// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWTs

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true, // Remove leading/trailing whitespace
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Ensure emails are unique
      trim: true,
      lowercase: true, // Store emails in lowercase
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Basic email regex validation
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    aadhaarNumber: {
        type: String,
        // Aadhaar numbers are typically 12 digits. Basic validation regex.
        // Consider stronger validation if necessary.
        match: [/^\d{12}$/, 'Please add a valid 12-digit Aadhaar number'],
        unique: true, // Aadhaar numbers should be unique per user
        sparse: true // Allows multiple documents to have a null/undefined value for this field
    },
    familyMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
      },
    ],
    // You might add other profile fields here later, e.g., dateOfBirth, address, etc.
    // profilePicture: {
    //     type: String,
    //     default: null // or a path to a default image
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  // Generate a salt
  const salt = await bcrypt.genSalt(10);
  // Hash the password
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE, // e.g., '30d' or '1h'
  });
};

// Method to match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Note: 'this.password' is available here because we explicitly retrieve it in the auth controller
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;