import { GoogleGenAI } from '@google/genai';

// Initialize the GoogleGenAI client with your API key
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Define the Actor class
class Actor {
    constructor(actor_id, actor_instructions) {
        this.actor_id = actor_id;
        this.actor_instructions = actor_instructions;
    }

    // Initialize the chat model with the actor's instructions
    modelChat = ai.chats.create({
        model: 'gemini-2.0-flash',
        systemMessage: this.actor_instructions,
    });

    // Method to send a message to the chat model and receive a response
    async chat(message) {
        const response = await this.modelChat.sendMessage({
            message: message,
            context: process.env.chat_context, // Optional context for specifying the type of content provided to the model
        })

        console.log('Response:', response);
        return response;
    }
}
