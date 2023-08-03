const express = require('express')

const userRoutes = express.Router()

// Importing jobs controller methods
const { 
    registerUser, 
    loginUser,
    forgotPassword,
    resetPassword, 
    logout
} = require('../controllers/userController')

// Importing users authentication method
const { 
    isAuthenticatedUser
} = require('../middlewares/authUser')

userRoutes.route('/register').post( registerUser )

userRoutes.route('/login').post( loginUser )

userRoutes.route('/password/forgot').post( forgotPassword )

userRoutes.route('/password/reset/:token').put( resetPassword )

userRoutes.route('/logout').get( isAuthenticatedUser, logout )

module.exports = userRoutes