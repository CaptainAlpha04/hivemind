import Actor from "../logic/actor.mjs";

export async function initializeAgents(userID, agentID, agentInstructions) {
    // Import class Actor to create a new agent

    const actorInstance = new Actor(userID, agentID, agentInstructions);
    // Initialize the chat model with the actor's instructions

    return actorInstance;
}

