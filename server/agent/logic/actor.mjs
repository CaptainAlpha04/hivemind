import { GoogleGenAI, SafetyFilterLevel } from '@google/genai';
import dotenv from 'dotenv';
import cleanJSON from 'cleanllmjson';
dotenv.config();

// Initialize the GoogleGenAI client with your API key
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Define the Actor class
class Actor {
    constructor(actorInstructions) {
        this.actorInstructions = actorInstructions;
        console.log('Actor Instructions:', actorInstructions);
         // Initialize the chat model with the actor's instructions
        this.modelChat = ai.chats.create({
            model: 'gemini-2.0-flash',
        });
    }

    // Method to send a message to the chat model and receive a response
    async chat(userID, message) {
        const response = await this.modelChat.sendMessage({
            message: message,
            context: process.env.chat_context, // Optional context for specifying the type of content provided to the model
            config: {
                systemInstruction: process.env.AGENT_PERSONALITY + "Your personality is:" + this.actorInstructions, // Instructions for the actor
                safetyFilterLevel: SafetyFilterLevel.LOW, // Set the safety filter level to LOW
            }
        })
        const cleanResponse = cleanJSON(response.text);
        console.log('Response:', cleanResponse.response);
        console.log('Emotions', cleanResponse.emotions);
        return cleanResponse.response;
    }

    async analyzePost(userID, agent, post) {
        const response = await this.modelChat.sendMessage({
            message: post,
            context: process.env.post_context, // Optional context for specifying the type of content provided to the model
        })

        console.log('Response:', response.text);
        return response.text;
    }
}

export default Actor;
