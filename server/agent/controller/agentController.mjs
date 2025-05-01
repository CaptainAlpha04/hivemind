import Actor from "../logic/actor.mjs";

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

