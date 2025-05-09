import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import Mongoose
//import { Auth } from "@auth/express";
// import { authConfig } from './auth.config.mjs'; // Ensure this path is correct
import chatRoutes from './api/getChat.mjs'; // Ensure this path is correct
import messageRoutes from './api/messageRoutes.mjs'; // Import the new message routes
import postRoutes from './api/postRoutes.mjs'; // Import the new post routes

// Importing the routes
import actorRoute from './agent/routes/actorRoutes.mjs';

// Importing functions from the controller
import { generateActorPersona, generateActorProfileImage } from './agent/controller/agentController.mjs';

dotenv.config();

// Setting up the global variables
const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;


// --- Mongoose Connection Setup ---
// if (!mongoURI) {
//     console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
//     // process.exit(1); // Exit if DB connection string is missing
// }

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connected via Mongoose...'))
//     .catch((err) => {
//         console.error('MongoDB connection error:', err.message);
//         process.exit(1); // Exit if connection fails
//     });

// Handle connection events (optional but recommended)
mongoose.connection.on('error', err => {
  console.error('Mongoose runtime error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected.');
});
// --- End Mongoose Connection Setup ---

// Initializing the middleware
app.use(cors());
app.use(express.json());
// Apply Auth.js middleware
// app.use(Auth(authConfig)); // Ensure authConfig is correctly imported and configured

app.get('/', async (req, res) => {
    res.send('API is running'); // Provide a response for the root route
});

// Using the routes
actorRoute(app);
app.use('/api', chatRoutes); // Mounts the chat routes under /api
app.use('/api/messages', messageRoutes); // Mount the message routes under /api/messages
app.use('/api/posts', postRoutes); // Mount the post routes under /api/posts

await generateActorPersona(); // Call the function to generate an actor persona

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on ${port}...`);
});