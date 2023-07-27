const mongoose = require('mongoose')
const { Client } = require('pg')

const connAtlasMongoDB =  () => { 
    mongoose.connect(process.env.DB_ATLAS_CLUSTER_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => {
        console.log(`Remote Atlas Cluster Database Connect: ${con.connection.host}`)
    })
}

const connLocalMongoDB =  () => { 
    console.log(`DB_LOCAL_MONGO_URI: ${process.env.DB_LOCAL_MONGO_URI}`)
    mongoose.connect(process.env.DB_LOCAL_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => {
        console.log(`Local MongoDB Database Connect: ${con.connection.host}`)
    })
}

const connLocalPostgresDB = async () => {
    const client = new Client({
        connectionString: process.env.DB_LOCAL_POSTGRES_URI,
    });
    await client.connect();
    console.log(`Local PostgreSQL Database connected: ${client.host}`);
}

const connectDB = () => {
    if (process.env.DB_IN_USE === 'ATLAS') {
        connAtlasMongoDB()
    } else if (process.env.DB_IN_USE === 'LOCAL_MONGO') {
        connLocalMongoDB()
    } else if (process.env.DB_IN_USE === 'LOCAL_POSTGRES') {
        connLocalPostgresDB()
    } else {
        console.log('./config/database.js=> No valid DB_IN_USE defined in environment.');
        process.exit(1);
    }
}

module.exports = connectDB 