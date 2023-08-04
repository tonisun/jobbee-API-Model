const { escapeXML } = require('ejs')
const Job = require('../models/Job')
const geoCoder = require('../utils/geocoder')
const ErrorHandler = require('../utils/errorHandler')
const logger = require('../utils/logger')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const APIFilters = require('../utils/apiFilters')
const path = require('path')

// Get all Jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors( async (req, res, next) => {

    const apiFilters = new APIFilters(Job.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination()

    const jobs = await apiFilters.query

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })  
})

// Create a new Job => /api/v1/job/new
exports.newJob = catchAsyncErrors( async (req, res, next) => {
    // Adding User ID to body.user
    req.body.user = req.user.id
    
    //console.log(req.body)

    const job = await Job.create(req.body)

    res.status(200).json({
        success: true,
        message: 'Job was successfully created',
        data: job
    })
})




// Get a job by ID  => /api/v1/job/:id
exports.getJob = catchAsyncErrors( async (req, res, next) => {
    const job = await Job.findById(req.params.id)

    if (!job) return next(new ErrorHandler( 'Job not found', 404 ))
    
    res.status(200).json({
        success: true,
        data: job
    })
})

// Update a job => /api/v1/job/:id
exports.updateJob = catchAsyncErrors( async (req, res, next) => {

    let job = await Job.findById(req.params.id)

    if (!job) return next(new ErrorHandler( 'Job not found', 404 ))

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: job
    })
})

// Delete a Job => /api/v1/job/:id
exports.deleteJob = catchAsyncErrors( async (req, res, next) => {

    let job = await Job.findById(req.params.id)

    if (!job) return next(new ErrorHandler( 'Job not found', 404 ))

    job = await Job.findByIdAndDelete(req.params.id)
    

    res.status(200).json({
        success: true,
        message: 'Job was deleted successfully'
    })
})




// Get a singel job by id and slug => /api/v1/job/:id/:slug
exports.getJobBySlug = catchAsyncErrors( async (req, res, next) => {
    //const job = await Job.findById(req.params.id)
    const job = await Job.find({
        $and: [
            { 
                _id: req.params.id
            },{
                slug: req.params.slug
            }
        ]
    })

    if (!job || job.length === 0 ) return next(new ErrorHandler( 'Job not found', 404 ))
    
    res.status(200).json({
        success: true,
        data: job
    })
})

// Search for a jobs with radius => /api/v1/jobs/:zipcode/:distance 
exports.getJobsInRadius = catchAsyncErrors( async (req, res, next) => {
    const { zipcode, distance } = req.params

    // getting longitude and latitude from geoCoder with zipcode
    const loc = await geoCoder.geocode(zipcode)

    const longitude = loc[0].longitude
    const latitude = loc[0].latitude

    const radius = distance / 3963

    const jobs = await Job.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [ 
                        longitude,
                        latitude
                    ], 
                    radius
                ]
            }
        }
    })

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
})

// Get statistics about a topic(job) => /api/v1/stats/:topic
exports.getJobStatistics = catchAsyncErrors( async (req, res, next) => {
    const stats = await Job.aggregate([
        {
            $match: {
                $text: {
                    $search: "\"" + req.params.topic + "\""
                }
            }
        },{
            $group: {
                _id: { 
                    $toUpper: '$experience'
                },
                totalJobs: {
                    $sum: 1
                },
                avgPosition: {
                    $avg: '$positions'
                }, 
                avgSalary: {
                    $avg: '$salary'
                },
                minSalary: { 
                    $min: '$salary' 
                },
                maxSalary: {
                    $max: '$salary'
                }
            }
        }
    ])

    if (stats.length === 0) return next(new ErrorHandler( `No stats found for - ${req.params.topic}`, 200 ))

    res.status(200).json({
        success: true,
        data: stats
    })
})

// Apply to job using Resume.pdf => /api/v1/job/:id/apply
exports.applyJob = catchAsyncErrors( async (req, res, next) => {

    let job = await Job.findById(req.params.id).select('+applicantsApplied')

    if (!job) return next( new ErrorHandler(`Job not found.`, 404))

    // Check that if job last date has been passed or not
    if (job.lastDate < new Date( Date.now())) return next( 
        new ErrorHandler(`You can not apply to this job. Date is over.`, 400)
    )

    // Check if user applied before
    for (let i=0; i < job.applicantsApplied.length; i++)
        if (job.applicantsApplied[i].id === req.user.id) return next ( 
            new ErrorHandler(`You have already applied for this job.`, 400)
        )

    // Check the files
    if (!req.files) return next(
        new ErrorHandler(`Please upload files to apply for this job.`, 400)
    )

    const file = req.files.file

    // Check file type or PDF or DOX
    const supportedFiles = /.docx|.pdf/
    if (!supportedFiles.test(path.extname(file.name))) return next( 
        new ErrorHandler(`Please upload files with doc or pdf extention.`, 400)
    )

    // Check file size
    if (file.size > process.env.MAX_FILE_SIZE) return next( 
        new ErrorHandler(`Please upload file less than 2MB.`, 400)
    )

    // Renaming file
    file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {

        if (err) return next( 
            new ErrorHandler(`Moving your Resume to /public/uploads/ is not done.`, 500)
        )
        
        //console.log(`file ${file.name} was successfully uploaded`)

        await Job.findByIdAndUpdate( 
            req.params.id, 
            {
                $push : {
                    applicantsApplied: {
                        id : req.user.id,
                        resume: file.name
                    } 
                }
            }, {
                new : true,
                runValidators: true,
                useFindAndModify: false
            }
        )

        res.status(200).json({
            success: true,
            message: 'Applied to Job successfully.',
            data: file.name
        })   
    })
})


