import { GoogleGenAI, SafetyFilterLevel } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the GoogleGenAI client with your API key
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Define the Actor class
class Actor {
    constructor(actorInstructions) {
        this.actorInstructions = actorInstructions;
    }

    // Initialize the chat model with the actor's instructions
    modelChat = ai.chats.create({
        model: 'gemini-2.0-flash',
        systemMessage: this.actorInstructions,
    });

    // Method to send a message to the chat model and receive a response
    async chat(userID, agent, message) {
        const response = await this.modelChat.sendMessage({
            message: message,
            context: process.env.chat_context, // Optional context for specifying the type of content provided to the model
        })

        console.log('Response:', response.text);
        return response.text;
    }

}

export default Actor;
