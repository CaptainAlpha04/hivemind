import Actor from "../logic/actor.mjs"

const route = (app) => {
    
    const actor = new Actor()
    
    app.post('/chat', async (req, res) => {
        // Create a new Actor instance
        const { actor_id, actor_instructions, message } = req.body
        // Send the message to the chat model and get the response
        const response = await actor.chat(message)

        // Send the response back to the client
        res.json({ response })
    })
}

export default route