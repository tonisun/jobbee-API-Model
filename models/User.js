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
    careersURL:{
        type: String,
        unique: true,
        required: [ true, 'Please enter a career URL.' ],
        validate: [ validator.isURL, 'Please enter a valid URL.' ]
    },
    role: {
        type: String,
        enum: {
            values: [ 'user', 'admin', 'employer' ],
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
},{
    toJSON : { virtuals : true },
    toObject : { virtuals : true }
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
    this.resetPasswordExpire = Date.now() + 30*60*1000

    return resetToken
}

// Show all jobs created by user using virtuals
userSchema.virtual('jobsPublished', {
    ref : 'Job', // The ref model to use is Job
    localField : '_id', // Find user where `localField`  
    foreignField : 'user', // this field here has to match the ref path we want to populate!   
    justOne : false
})

// In this case, Mongoose will associate the "User" Model Object
// with the "users" collection in your MongoDB database.
module.exports = mongoose.model('User', userSchema, 'users')

