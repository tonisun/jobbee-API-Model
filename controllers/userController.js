const User = require('../models/User')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')

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
