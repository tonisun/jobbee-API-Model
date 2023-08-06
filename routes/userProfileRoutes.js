const express = require('express')
const UserProfileRoutes = express.Router()

const { 
    getUserProfile, 
    updatePasswords,
    updateUser,
    deleteUser
} = require('../controllers/userProfileController')

const { 
    isAuthenticatedUser 
} = require('../middlewares/authUser')


UserProfileRoutes.route('/me').get( isAuthenticatedUser, getUserProfile )

UserProfileRoutes.route('/password/update').put( isAuthenticatedUser, updatePasswords )

UserProfileRoutes.route('/me/update').put( isAuthenticatedUser, updateUser )

UserProfileRoutes.route('/me/delete').delete( isAuthenticatedUser, deleteUser )

module.exports = UserProfileRoutes