const express = require('express')

const jobRoutes = express.Router()

// Importing jobs controller methods
const { getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, getJobBySlug, getJobStatistics } = require('../controllers/jobController')

jobRoutes.route('/jobs').get( getJobs )

jobRoutes.route('/jobs/:zipcode/:distance').get( getJobsInRadius )

jobRoutes.route('/job/:id/:slug').get( getJobBySlug )

jobRoutes.route('/stats/:topic').get( getJobStatistics )

jobRoutes.route('/job/new').post( newJob )

jobRoutes.route('/job/:id')
    .get( getJob )
    .put( updateJob )
    .delete( deleteJob )

module.exports = jobRoutes