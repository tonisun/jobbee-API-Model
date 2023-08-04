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

// Update current user password PUT => /api/v1/password/update
exports.updatePasswords = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    // Check previous password
    const isMached = await user.comparePassword(req.body.currentPassword)

    if (!isMached) return next( new ErrorHandler(`current Password is incorrect`, 401))

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})

// Update current user data PUT => /api/v1/me/update
exports.updateUser = catchAsyncErrors( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// Delete current user DELETE => /api/v1/me/delete
exports.deleteUser = catchAsyncErrors( async (req, res, next) => {

    await User.findByIdAndDelete(req.user.id)

    res.cookie('token', 'none', {
        expires: new Date( Date.now()),
        httpOnly: true
    }) 

    res.status(200).json({
        success: true,
        message: 'Your account has been deleted successfully'
    })
})

