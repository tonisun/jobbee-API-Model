const express = require('express')

const userRoutes = express.Router()

// Importing jobs controller methods
const { 
    registerUser, 
    loginUser 
} = require('../controllers/userController')

userRoutes.route('/register').post( registerUser )

userRoutes.route('/login').post( loginUser )

module.exports = userRoutes