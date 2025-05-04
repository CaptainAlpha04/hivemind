import express from 'express';
import mongoose from 'mongoose';
import Conversation from '../model/conversation.mjs';
import User from '../model/user.mjs'; // Import the User model

const router = express.Router();

// GET /api/chats - Fetch conversations using embedded last message
router.get('/chats', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

    try {
        // Step 1: Fetch the user document to get their conversation IDs
        const user = await User.findById(userId).select('conversationIds').lean();

        if (!user || !user.conversationIds || user.conversationIds.length === 0) {
            return res.status(200).json([]); // Return empty array if no conversations
        }

        // Step 2: Find conversations using the IDs and sort by updatedAt (reflects last message time)
        const conversations = await Conversation.find({
            _id: { $in: user.conversationIds }
        })
        .sort({ updatedAt: -1 }) // Sort by when the conversation was last updated
        // Optional: Populate participant details if needed for the UI
        // .populate('participants', 'username profilePicture')
        // The last message sender username is already embedded if updated correctly
        .lean(); // Use lean for performance as we are just reading data

        // The 'lastMessage.content' should already contain "Media" if applicable
        // based on the logic when the message was created/conversation updated.

        return res.status(200).json(conversations);

    } catch (error) {
        console.error('Failed to fetch chats with embedded last message:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;