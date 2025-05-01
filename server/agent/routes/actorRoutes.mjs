import { initializeAgents, handleChatRequest } from "../controller/agentController.mjs";

const actorRoute = (app) => {
    
    let agent = null;

    app.post('/chat', async (req, res) => {
        try {
            // Send the message to the chat model and get the response
            const { userID, agentID, message } = req.body;
    
            // Check agents
            agent = await initializeAgents(process.env.actorInstructions);
            
            // Check if agent is initialized
            const response = await handleChatRequest(userID, agentID, agent, message);
    
            // Send the response back to the client
            res.json({ response })
            
        } catch (error) {
            console.error('Error in /chat route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
}

export default actorRoute