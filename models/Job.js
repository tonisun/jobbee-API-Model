const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const geoCoder = require('../utils/geocoder')


const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Please enter Job title.'],
        trim: true,
        maxlength: [ 100, 'Job title cannot exceed 100 characters.'],
        minlength: [ 3, 'Job title must not be shorter than 3 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [ true, 'Please enter Job description'],
        maxlength: [ 1000, 'Job description cannot exceed 1000 characters.']
    },
    email: {
        type: String,
        "lowercase": true,
        validate: [ validator.isEmail, 'Please add a valid email address.']
    },
    careersURL:{
        type: String,
        required: [ true, 'Please enter a career URL.' ],
        validate: [ validator.isURL, 'Please enter a valid URL.' ]
    },
    address: {
        type: String,
        required: [ true, 'Please add an address.']
    },
    location: {
        type: {
            type: String,
            enum: [ 'Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [ true, 'Please add Company name']
    },
    industry: {
        type: [String],
        required: [true, 'Please enter industry for this job'],
        enum: {
            values: [
            'Business', 'IT', 'Banking', 'Education', 'Training', 'Telecommunication','Others'
            ],
            message: 'Please select correct options for industry.'
        }
    },
    jobType: {
        type: String,
        required: [ true, 'Please enter job type.' ],
        enum: {
            values: ['Permanent', 'Temporary', 'Internship', 'Home office'],
            message: 'Please select correct options for job type.'
        }
    },
    minEducation: {
        type: String,
        required: [ true, 'Please choose minimum education for this job.' ],
        enum: {
            values: ['Bachelors', 'Masters', 'Phd'],
            message: 'Please select correct options for minimum education.'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true, 'Please enter experience in years for this job.' ],
        enum: {
            values: ['No Experience', '1 Year - 2 Years', '2 Years - 5 Years', '5 Years +'],
            message: 'Please select correct options for Experience.'
        }
    },
    salary: {
        type:  Number,
        required: [true, 'Please enter expected salary for this job.']
    },
    postingDate: {
        type: Date,
        default: () => Date.now()
    },
    lastDate: {
        type: Date,
        default: () => new Date().setDate( new Date().getDate() + 7 )
    },
    applicantsApplied: {
        type: [Object],
        select: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})


// Creating Job Slug before saving
jobSchema.pre('save', function(next) {

    // Creaating slug befor saving to DB
    this.slug = slugify(this.title, { lower: true})

    next()
})

// Setting up Location
jobSchema.pre('save', async function(next) {
    const loc = await geoCoder.geocode(this.address)

    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude , loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    } 
})


// In this case, Mongoose will associate the "Job" model Object
// with the "jobs" collection in your MongoDB database.
module.exports = mongoose.model('Job', jobSchema, 'jobs')