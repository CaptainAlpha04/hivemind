import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Importing the routes
import actorRoute from './agent/routes/actorRoutes.mjs'

dotenv.config()

// Setting up the global variables
const app = express()
const port = process.env.PORT || 5000
const mongoURI = process.env.MONGO_URI

// Connecting to the MongoDB database
// mongoose.connect(mongoURI).then(() => {
//     console.log('MongoDB connected...')
// }).catch((err) => {
//     console.error('MongoDB connection error:', err.message)
// })

// Initializing the middleware
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    
})

// Using the routes
actorRoute(app)

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on ${port}...`)
})