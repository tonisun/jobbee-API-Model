const User = require('../models/User')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

// Register a new user POST => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const {name, email, password, role} = req.body

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    res.status(200).json({
        success: true,
        message: 'User is registered successfully.',
        data: user
    })
})