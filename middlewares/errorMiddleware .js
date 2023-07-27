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

        res.status(err.statusCode).json({
            success : false,
            message : err.message || 'Internal Server Error.'
        })
    }
}
