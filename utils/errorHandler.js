/**
 * Custom error handler to throw API errors with standard HTTP status codes.
 */
class ErrorHandler extends Error {
    /**
     * Construct a new error handler.
     * @param {String} message - The error message.
     * @param {Number} statusCode - The HTTP status code of the error.
    */
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode

        Error.captureStackTrace( this, this.constructor)
    }
}

module.exports = ErrorHandler