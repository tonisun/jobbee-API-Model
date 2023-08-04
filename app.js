const express = require('express')

const logger = require('./utils/logger')

const app = express()

const dotenv = require('dotenv')

const cookieParser = require('cookie-parser')

const fileUpload = require('express-fileupload')

const errorMiddleware = require('./middlewares/errorMiddleware ')

const faviconMiddleware = require('./middlewares/faviconMiddleware')

const ErrorHandler = require('./utils/errorHandler')

// Set up config.env file variables
dotenv.config({
    path: './config/config.env',
})

// Handling Uncaught Exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down due to uncaught exception: ${err.stack}`);
    process.exit(1)
})

// database.js import
const connectDB = require('./config/database')

// Connecting to database
connectDB()

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

// Setup body parser
app.use(express.json())

// Set cookie parser
app.use(cookieParser())

// Handle file uploads
app.use(fileUpload())

// No store for Cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Setup faviconMiddleware
faviconMiddleware(app)


// Setup Logger
app.use((req, res, next) => {
    const oldSend = res.send;
    const oldStatus = res.status;
  
    res.status = function (statusCode) {
        if (statusCode >= 400) {
            logger.error(`Time: ${new Date().toString()}, Path: ${req.path}, StatusCode: ${statusCode}`)
        }
    
        return oldStatus.apply(this, arguments)
    }
  
    res.send = function (data) {
        if (!res.headersSent && res.statusCode >= 200 && res.statusCode < 300) {
            logger.info(`Time: ${new Date().toString()}, Path: ${req.path}, StatusCode: ${res.statusCode}`)
        }
    
        return oldSend.apply(this, arguments)
    }
  
    next()
})


app.get('/', ( req, res) => {
    res.send('Hi, world world')
})

// Test ErrorHandler
app.get('/test-error', (req, res, next) => {
    res.status(400).send(`<h1 align="center">Time: ${new Date().toString()}, Path: ${req.path}, StatusCode: >= 400</h1>`)
    next()
})

// Importing all routes
const jobRoutes = require('./routes/jobRoutes')
const userRoutes = require('./routes/userRoutes')
const userProfileRoutes = require('./routes/userProfileRoutes')

app.use('/api/v1', jobRoutes)
app.use('/api/v1', userRoutes)
app.use('/api/v1', userProfileRoutes)

// Handle Unhandled Routes
app.all('*', (req, res, next) => {
    logger.error(`Time: ${new Date().toString()}, Path: ${req.path}, StatusCode: 404, ${req.originalUrl} route not found`)
    next( new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

// Setup middlewares errorMiddleware
app.use(errorMiddleware)

// Starts the Server
const API_PORT = process.env.API_PORT
const server = app.listen(API_PORT, () => {
    console.log(`Time: ${new Date().toString()} => Server started at port ${API_PORT} in ${process.env.NODE_ENV} mode.`)  
    logger.info(`Time: ${new Date().toString()} => Server started at port ${API_PORT} in ${process.env.NODE_ENV} mode.`) 
})

// Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Time: ${new Date().toString()} => Error: ${err.message}`);
    logger.error(`Time: ${new Date().toString()} => Unhandled Promise Rejection: ${err.message}`)
    console.log(`Time: ${new Date().toString()} => Shutting down the server due to unhandled promise rejection.`)

    server.close( () => {
        process.exit(1)
    })
})

