const User = require('../models/User')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// Register a new user POST => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const {name, email, password, role} = req.body

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    // Create JSON Web Token
    sendToken(user, 200, res)
})

// Login user => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req,res, next) => {
    const {email, password} = req.body

    // Checks if email or??? password are entered by user
    if (!email || !password) return next(new ErrorHandler('Invalid email or password.', 400))

    // Finding user in database
    const user = await User.findOne({email}).select('+password')

    if (!user) return next( new ErrorHandler('Invalid email and password.', 401))

    // Check if user password is correct
    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) return next(new ErrorHandler('Invalid email or password.', 500))
    
    // Create JSON Web Token
    sendToken(user, 200, res)
})

// Forgot Password POST => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async ( req, res, next ) => {
    const user = await User.findOne({email: req.body.email})

    if (!user) return next( new ErrorHandler(`No user found with this email: ${req.body.email} .`, 404))

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // Create reset password url
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset link is as follow: \n\n<a href="${resetURL}">${resetURL}</a>
    \n\nIf you have not request this, then pleasse ignore that.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Jobbee-API Password Recovery',
            message
        })
    
        res.status(200).json({
            success: true,
            message: `Email send successfully to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })

        return next( new ErrorHandler(`Email is not sent`, 500))
    }

    
})
