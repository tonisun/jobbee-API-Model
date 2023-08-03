const express = require('express')

const jobRoutes = express.Router()

// Importing jobs controller methods
const { 
    getJobs, 
    newJob, 
    getJobsInRadius, 
    updateJob, 
    deleteJob, 
    getJob, 
    getJobBySlug, 
    getJobStatistics 
} = require('../controllers/jobController')

// Importing users authentication and roles methods
const { 
    isAuthenticatedUser, 
    authorizeRoles 
} = require('../middlewares/authUser')

jobRoutes.route('/jobs').get( getJobs )

jobRoutes.route('/jobs/:zipcode/:distance').get( getJobsInRadius )

jobRoutes.route('/job/:id/:slug').get( getJobBySlug )

jobRoutes.route('/stats/:topic').get( getJobStatistics )

jobRoutes.route('/job/new').post( isAuthenticatedUser, authorizeRoles('employeer', 'admin'), newJob )

jobRoutes.route('/job/:id')
    .get( getJob )
    .put( isAuthenticatedUser, authorizeRoles('employeer', 'admin'), updateJob )
    .delete( isAuthenticatedUser, authorizeRoles('employeer', 'admin'), deleteJob )

module.exports = jobRoutes