// Create and send token and save it in cookie
const sendToken = async (user, statusCode, res) => {
    // Create JWT Token
    const token = user.getJwtToken()

    // Options for cookie COOKIE_EXPIRES_TIME
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly : true
    }

    // just in Production mode set options to secure => https://
    if (process.env.NODE_ENV === 'production') options.secure = true

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}

module.exports = sendToken