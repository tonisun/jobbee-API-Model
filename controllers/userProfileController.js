const User = require('../models/User')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')


// Get current user profile GET => /api/v1/me
exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// Update current user password POST => /api/v1/password/update
exports.updatePasswords = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    // Check previous password
    const isMached = await user.comparePassword(req.body.currentPassword)

    if (!isMached) return next( new ErrorHandler(`current Password is incorrect`, 401))

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})