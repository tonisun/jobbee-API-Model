const ErrorHandler  = require('../utils/errorHandler')
const logger = require('../utils/logger')

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500

    //logger.error(`Time: ${new Date().toISOString()}, Path: ${req.path}, Status: ${err.statusCode}, Error: ${err.stack}`)
    
    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
            success : false,
            error : err,
            errMessage : err.message,
            stack : err.stack
        })
    } 

    if (process.env.NODE_ENV === "production") {
        let error = {...err}

        error.message = err.message

        // Wrong Mongoose Object ID Error Message
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            const errMsg = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(errMsg, 404)
        }

        // Handling MongooseValidation Error Message
        if (err.name === 'ValidationError') {
            const errMsg = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler(errMsg, 400)
        }
            
        res.status(error.statusCode).json({
            success : false,
            message : error.message || 'Internal Server Error.'
        })
    }
}
