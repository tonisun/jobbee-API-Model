const express = require('express')

const userRoutes = express.Router()

// Importing jobs controller methods
const { 
    registerUser, 
    loginUser,
    forgotPassword,
    resetPassword
} = require('../controllers/userController')

userRoutes.route('/register').post( registerUser )

userRoutes.route('/login').post( loginUser )

userRoutes.route('/password/forgot').post( forgotPassword )

userRoutes.route('/password/reset/:token').put( resetPassword )

module.exports = userRoutes