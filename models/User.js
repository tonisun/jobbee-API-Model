const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Please enter your name.' ]
    },
    email: {
        type: String,
        required: [ true, 'Please enter your email address.' ],
        unique: true,
        validate: [ validator.isEmail, 'Please enter a valid email address.' ]
    },
    role: {
        type: String,
        enum: {
            values: [ 'user', 'admin', 'employeer' ],
            message: 'Please select correct role.',
        },
        default: 'user',
    },
    password : {
        type: String,
        required: [ true, 'Please enter your password.'],
        minlength: [8, 'Your password must be at least 8 characters long.'],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// Encrypting password befor saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) next()
    this.password = await bcrypt.hash(this.password, 10)
})

// Return JSON Web Token
userSchema.methods.getJwtToken = function(){ 
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// Compare user password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Generate user reset password token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken =  crypto
        .randomBytes(20)
        .toString('hex')

    // Hash and set reset-password-token
    this.resetPasswordToken =  crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    // Set token expire time
    this.resetPasswordToken = Date.now() + 30*60*1000

    return resetToken
}


// In this case, Mongoose will associate the "User" Model Object
// with the "users" collection in your MongoDB database.
module.exports = mongoose.model('User', userSchema, 'users')

