import Actor from "../logic/actor.mjs";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import fs from 'fs';
import cleanJSON from 'cleanllmjson';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

export async function generateActorPersona() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: "Generate a totally random persona from different regions like India, Pakistan, Japan, Arabia, USA, Europe, Brazil, central Asia, Africa etc",
            config: {
                temperature: 1.5,
                systemInstruction: process.env.GENERATE_ACTOR_INSTRUCTS,
            }
        })

        const cleanedResponse = cleanJSON(response.text);
        console.log('Cleaned Response:', cleanedResponse);

        const physical_description = cleanedResponse.Physical_Description;
        const age = cleanedResponse.Age;
        const gender = cleanedResponse.Gender;
        const ethnicity = cleanedResponse.Ethnicity;
        const personality_traits = cleanedResponse.Personality_Traits;
        const religion = cleanedResponse.Religion;

        const build = physical_description.Build;
        const height = physical_description.Height;
        const hair = physical_description.Hair;
        const eyes = physical_description.Eyes;
        const distinguished_features = physical_description.Distinguished_Features;
        const style = physical_description.Style;

        generateActorProfileImage(build, height, hair, eyes, distinguished_features, style, age, gender, ethnicity, personality_traits, religion)

    } catch (error) {
        console.error('Error generating actor:', error);
    }
}

export async function generateActorProfileImage(build, height, hair, eyes, distinguished_features, style, age, gender, ethnicity, personality_traits, religion) {
    try {
        const content = `Generate a 1:1 aspect ratio hyper-realistic display picture (DP) for instagram of a ${age} year old ${ethnicity} ${religion} ${gender} with physical appearance of: build: ${build},height: ${height}, hair: ${hair},eyes: ${eyes}, features: ${distinguished_features}, style: ${style}. The image should be realistic and suitable for a profile picture. Also add a nice and realistic background.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: content,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            }
        });

    for (const part of response.candidates[0].content.parts) {
    // Based on the part type, either show the text or save the image
        if (part.text) {
        console.log(part.text);
        } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        fs.writeFileSync("gemini-native-image.png", buffer);
        console.log("Image saved as gemini-native-image.png");
        }
    }

    } catch (error) {
        console.error('Error generating actor profile image:', error);
    }
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


