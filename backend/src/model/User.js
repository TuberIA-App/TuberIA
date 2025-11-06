const mongoose = require('mongoose');

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
        minlength: 8
    },

    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

// Compound index is kept for quick lookups; email is unique for login
userSchema.index({ username: 1, email: 1 });

// TODO: add pre-save hook to hash password (bcrypt) before saving

module.exports = mongoose.model('User', userSchema);