import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Importing the routes
import route from './agent/routes/actorRoutes.mjs'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initializing the middleware
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    
})

// Using the routes
route(app)

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on ${port}...`)
})