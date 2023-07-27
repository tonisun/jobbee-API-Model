const { MongoClient, ServerApiVersion } = require('mongodb');
//const uri = "mongodb+srv://jobbee:8MIUxO4mOTg1tO7s@atlascluster.lszvvs3.mongodb.net/?retryWrites=true&w=majority";


// read the config.env file
const dotenv = require('dotenv')
dotenv.config({
  path: './config.env',
})
console.log('LogAtlasDB: '+ process.env.DB_ATLAS_CLUSTER_URI);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DB_ATLAS_CLUSTER_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);