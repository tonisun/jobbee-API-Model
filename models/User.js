const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    this.password = await bcrypt.hash(this.password, 10);
})

// Return JSON Web Token
userSchema.methods.getJwtToken = function(){ 
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// In this case, Mongoose will associate the "User" Model Object
// with the "users" collection in your MongoDB database.
module.exports = mongoose.model('User', userSchema, 'users')

