const express = require('express')
const UserProfileRoutes = express.Router()

const { 
    getUserProfile, 
    updatePasswords 
} = require('../controllers/userProfileController')

const { 
    isAuthenticatedUser 
} = require('../middlewares/authUser')



UserProfileRoutes.route('/me').get( isAuthenticatedUser, getUserProfile )

UserProfileRoutes.route('/password/update').put( isAuthenticatedUser, updatePasswords )

module.exports = UserProfileRoutes