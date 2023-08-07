const User = require('../models/User')
const Job = require('../models/Job')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')
const fs = require('fs')
const mongoose = require('mongoose')

const ObjectId = mongoose.Types.ObjectId;

// Get current user profile GET => /api/v1/me
exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// Update current user password PUT => /api/v1/password/update
exports.updatePasswords = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    // Check previous password
    const isMached = await user.comparePassword(req.body.currentPassword)

    if (!isMached) return next( new ErrorHandler(`current Password is incorrect`, 401))

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})

// Update current user data PUT => /api/v1/me/update
exports.updateUser = catchAsyncErrors( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// Get current user profile => /api/v1/me
exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findById(req.user.id);

    let userData;

    switch (user.role) {
        case 'user':
            // Suchen Sie nach allen Jobs, bei denen der Benutzer sich beworben hat
            const appliedJobs = await Job.find({"applicantsApplied.id": req.user.id})
                .select('title postingDate applicantsApplied.$');

            // Ändern Sie die Struktur, um nur die benötigten Informationen zu behalten
            const processedAppliedJobs = appliedJobs.map(job => {
                const applicant = job.applicantsApplied[0]; // MongoDB gibt das gefilterte Array zurück, wir nehmen das erste (und einzige) Element
                return {
                    title: job.title,
                    applicationDate: job.postingDate,
                    resume: applicant.resume
                };
            });

            const jobsAppliedCount = processedAppliedJobs.length;

            userData = {
                ...user._doc,
                jobsAppliedCount,
                appliedJobs: processedAppliedJobs,
            };
            break;

        case 'employer':
            const jobsPublished = await Job.find({user: req.user.id})
                .select('title postingDate');

            const jobsCount = jobsPublished.length;

            userData = {
                ...user._doc,
                jobsCount,
                jobsPublished
            };
            break;

        case 'admin':
            userData = {
                ...user._doc
            };
            break;
        
        default:
            return res.status(400).json({
                success: false,
                message: "Role not recognized",
            });
    }

    res.status(200).json({
        success: true,
        data: userData,
    });
});

// Delete current user DELETE => /api/v1/me/delete
exports.deleteUser = catchAsyncErrors( async (req, res, next) => {

    deleteUserFiles(req.user.id, req.user.role)

    const user = await User.findByIdAndDelete(req.user.id)

    res.cookie('token', 'none', {
        expires: new Date( Date.now()),
        httpOnly: true
    }) 

    res.status(200).json({
        success: true,
        message: 'Your account has been deleted successfully'
    })
})

// Delete user files and employeer jobs
async function deleteUserFiles(user, role) {

    if (role === 'employer') {
        await Job.deleteMany({ user: user})
    }

    if (role === 'user') {
        const appliedJobs = await Job.find({
            'applicantsApplied.id' : user
        }).select('+applicantsApplied')

        console.log(`appliedJobs: ${appliedJobs}` );

        for (let i=0; i < appliedJobs.length; i++) {
            let obj = appliedJobs[i].applicantsApplied.find( o => o.id === user)

            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', '')

            fs.unlink(filepath, err => {
                if (err) return console.log(err);
            })
                        
            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id))

            appliedJobs[i].save()
        }
    }
}