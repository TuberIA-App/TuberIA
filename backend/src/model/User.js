/**
 * @fileoverview User model definition with authentication methods.
 * Handles user data storage, password hashing, and JWT token generation.
 * @module model/User
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PASSWORD_SALT_ROUNDS } from '../config/constants.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';

/**
 * @typedef {Object} UserDocument
 * @property {mongoose.Types.ObjectId} _id - MongoDB document ID
 * @property {string} id - Virtual hex string ID
 * @property {string} username - Unique username
 * @property {string} [name] - Display name
 * @property {string} email - Unique email address (lowercase)
 * @property {string} password - Hashed password (excluded from queries by default)
 * @property {Date} [lastLogin] - Last login timestamp
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 * @property {function(string): Promise<boolean>} comparePassword - Compare password method
 * @property {function(): {accessToken: string, refreshToken: string}} generateAuthTokens - Generate JWT tokens
 */

/**
 * Mongoose schema for User documents.
 * @type {mongoose.Schema<UserDocument>}
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: 1
    },

    name: {
        type: String,
        trim: true
    },

    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Invalid email format']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },

    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

// Compound index for quick lookups (email already has unique index from schema definition)
userSchema.index({ username: 1, email: 1 });

// Define the a virtual for the ID
userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

/*
* toJSON with best security since includes the virtuals, hides the __v (versionKey: false) globally, 
* and hide the password (even if select: false already does the job, it brings an extra security layer)
*/
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.password;
        return ret;
    }
});

/**
 * Pre-save hook to hash password before saving.
 * Only hashes if password field has been modified.
 * @private
 */
userSchema.pre('save', async function(next) {
    // We will only hash the password if it has been modified or if it's new
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate the salt and hash of the password
        const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Compares a candidate password with the stored hashed password.
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If bcrypt comparison fails
 * @example
 * const user = await User.findById(id).select('+password');
 * const isValid = await user.comparePassword('userPassword123');
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

/**
 * Generates JWT access and refresh tokens for the user.
 * @returns {{accessToken: string, refreshToken: string}} Object containing both tokens
 * @example
 * const user = await User.findById(id);
 * const { accessToken, refreshToken } = user.generateAuthTokens();
 */
userSchema.methods.generateAuthTokens = function() {
    const accessToken = generateAccessToken({
        userId: this._id.toString(),
        email: this.email
    });

    const refreshToken = generateRefreshToken({
        userId: this._id.toString()
    });

    return {
        accessToken,
        refreshToken
    };
}

export default mongoose.model('User', userSchema);