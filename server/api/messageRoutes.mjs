import express from 'express';
import mongoose from 'mongoose';
import Message from '../model/message.mjs';
import Conversation from '../model/conversation.mjs';
import User from '../model/user.mjs'; // Needed to get sender's username

const router = express.Router();

// POST /api/messages - Send a new message
router.post('/', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const senderId = new mongoose.Types.ObjectId(userIdString);

    const { conversationId, content, mediaUrl } = req.body;

    // Validate required fields
    if (!conversationId || (!content && !mediaUrl)) {
        return res.status(400).json({ message: 'Missing required fields: conversationId and either content or mediaUrl' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }

    try {
        // 1. Verify the conversation exists and the sender is a participant
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: senderId
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or user is not a participant.' });
        }

        // 2. Get sender's username (optional but good for denormalization)
        const sender = await User.findById(senderId).select('username').lean();
        if (!sender) {
            return res.status(404).json({ message: 'Sender user not found.' }); // Should not happen if authenticated
        }

        // 3. Create the new message
        const newMessage = new Message({
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
            mediaUrl: mediaUrl,
            readBy: [senderId] // Sender has implicitly read the message
        });

        await newMessage.save();

        // 4. Update the conversation's lastMessage and timestamp
        conversation.lastMessage = {
            messageId: newMessage._id,
            senderId: senderId,
            senderUsername: sender.username, // Store username
            content: content ? content : (mediaUrl ? 'Media' : ''), // Store content or "Media"
            mediaUrl: mediaUrl, // Store mediaUrl if present
            createdAt: newMessage.createdAt // Use message creation time
        };
        // Mongoose automatically updates `updatedAt` on save if timestamps: true
        await conversation.save();

        // 5. Return the newly created message
        // Optionally populate sender details if needed by the client immediately
        // const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'username profilePicture').lean();
        // return res.status(201).json(populatedMessage);

        return res.status(201).json(newMessage); // Return the basic message object

    } catch (error) {
        console.error('Failed to send message:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
