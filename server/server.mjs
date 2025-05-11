import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import Mongoose
//import { Auth } from "@auth/express";
// import { authConfig } from './auth.config.mjs'; // Ensure this path is correct
import postRoutes from './api/postRoutes.mjs'; // Import the new post routes
import userRoutes from './api/userRoutes.mjs'; // New import for user routes
import chatRoutes from './api/chatRoutes.mjs'; // New import for consolidated chat routes
import recommendationRoutes from './api/recommendationRoutes.mjs'; // Import recommendation routes
import botRoutes from './api/botRoutes.mjs'; // Add import for bot routes
import { verifyConnectivity } from './config/neo4jConfig.mjs'; // Import Neo4j connection verifier

// Importing the routes
import actorRoute from './agent/routes/actorRoutes.mjs';

// Importing functions from the controller
import { generateActorPersona, generateActorProfileImage } from './agent/controller/agentController.mjs';

dotenv.config();

// Setting up the global variables
const app = express();
const port = process.env.PORT || 3001; // Update port to match suggested code

const mongoURI = process.env.MONGO_URI;


// --- Mongoose Connection Setup ---
if (!mongoURI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
    // process.exit(1); // Exit if DB connection string is missing
}

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected via Mongoose...'))
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit if connection fails
    });

// Handle connection events (optional but recommended)
mongoose.connection.on('error', err => {
  console.error('Mongoose runtime error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected.');
});
// --- End Mongoose Connection Setup ---

// Verify Neo4j connectivity
verifyConnectivity()
  .catch(error => {
    console.error('Neo4j connection issue:', error);
    console.warn('Server starting without Neo4j connection. Recommendation features may not work correctly.');
  });

// Initializing the middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
})); // Update CORS configuration to match suggested code
app.use(express.json());
// Apply Auth.js middleware
// app.use(Auth(authConfig)); // Ensure authConfig is correctly imported and configured

app.get('/', async (req, res) => {
    res.send('API is running'); // Provide a response for the root route
});

// Using the routes
actorRoute(app);
app.use('/api/posts', postRoutes); // Mount the post routes under /api/posts

app.use('/api/users', userRoutes); // Mount the user routes under /api/users

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on ${port}...`);
});