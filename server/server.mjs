import express from 'express'
import cors from 'cors'

const app = express()
const port = 5000

// Initializing the middleware
app.use(cors())
app.use(express.json())

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on ${port}...`)
})