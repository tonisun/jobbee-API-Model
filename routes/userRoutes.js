const express = require('express')

const userRoutes = express.Router()

// Importing jobs controller methods
const { registerUser } = require('../controllers/userController')

userRoutes.route('/register').post( registerUser )



module.exports = userRoutes