import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PASSWORD_SALT_ROUNDS } from '../config/constants';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
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
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'El email no es válido']
    },

    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 8,
        select: false
    },

    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

// Compound index is kept for quick lookups; email is unique for login
userSchema.index({ email: 1 });
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

// PRE-SAVE HOOK => Hash password before saving
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

// CCOMPARE the password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// GENERATE the JWT tokens
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