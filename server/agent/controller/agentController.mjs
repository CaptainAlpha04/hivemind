import Actor from "../logic/actor.mjs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

export async function createNewActor() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: "Generate a random persona",
            config: {
                systemInstruction: process.env.GENERATE_ACTOR_INSTRUCTS,
            }
        })
    
        console.log('Response:', response.text);
    } catch (error) {
        console.error('Error generating actor:', error);
    }

    //! Link to the public npm package for cleaning the output created by MEEEE!
}

export async function initializeAgents(agentInstructions) {
    // Import class Actor to create a new agent

    const actorInstance = new Actor(agentInstructions);
    // Initialize the chat model with the actor's instructions

    return actorInstance;
}

export async function handleChatRequest(userID, agentID, actorInstance, message) {

    // Send the message to the chat model and get the response
    const response = await actorInstance.chat(userID, agentID, message);
    
    // Return the response
    return response;
}


