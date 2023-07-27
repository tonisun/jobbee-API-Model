const express = require('express')

const logger = require('./utils/logger')

const app = express()

const dotenv = require('dotenv')

const errorMiddleware = require('./middlewares/errorMiddleware ')

// Set up config.env file variables
dotenv.config({
    path: './config/config.env',
})

// database.js import
const connectDB = require('./config/database')

// Connecting to database
connectDB()

// Setup body parser
app.use(express.json())

// Setup Logger
app.use((req, res, next) => {
    const oldSend = res.send;
    const oldStatus = res.status;
  
    res.status = function (statusCode) {
        if (statusCode >= 400) {
            logger.error(`Time: ${new Date().toISOString()}, Path: ${req.path}, StatusCode: ${statusCode}`)
        }
    
        return oldStatus.apply(this, arguments)
    }
  
    res.send = function (data) {
        if (!res.headersSent && res.statusCode >= 200 && res.statusCode < 300) {
            logger.info(`Time: ${new Date().toISOString()}, Path: ${req.path}, StatusCode: ${res.statusCode}`)
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
    res.status(400).send(`<h1 align="center">Time: ${new Date().toISOString()}, Path: ${req.path}, StatusCode: >= 400</h1>`)
    next()
})


// Importing all routes
const jobRoutes = require('./routes/jobRoutes')
app.use('/api/v1', jobRoutes)

// Setup middlewares errorMiddleware
app.use(errorMiddleware)

// Starts the Server
const API_PORT = process.env.API_PORT
app.listen(API_PORT, () => {
    console.log(`Time: ${new Date().toISOString()} => Server started at port ${API_PORT} in ${process.env.NODE_ENV} mode.`)  
    logger.info(`Time: ${new Date().toISOString()} => Server started at port ${API_PORT} in ${process.env.NODE_ENV} mode.`) 
})

