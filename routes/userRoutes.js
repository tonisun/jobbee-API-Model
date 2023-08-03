const express = require('express')

const userRoutes = express.Router()

// Importing jobs controller methods
const { 
    registerUser, 
    loginUser,
    forgotPassword
} = require('../controllers/userController')

userRoutes.route('/register').post( registerUser )

userRoutes.route('/login').post( loginUser )

userRoutes.route('/password/forgot').post( forgotPassword )

module.exports = userRoutes