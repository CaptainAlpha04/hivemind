import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer'; // Import multer
import Message from '../model/message.mjs';
import Conversation from '../model/conversation.mjs';
import User from '../model/user.mjs'; // Needed to get sender's username

const router = express.Router();

// Configure multer for memory storage and file filter
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET /api/conversations - Get all conversations for a user
router.get('/conversations', async (req, res) => {
    const { userId: userIdString } = req.query;

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userId = new mongoose.Types.ObjectId(userIdString);

    try {
        // Optimized: Fetch user and populate conversationIds
        const user = await User.findById(userId).populate({
            path: 'conversationIds',
            options: { sort: { 'updatedAt': -1 } } // Sort conversations by updatedAt
        }).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user.conversationIds);
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/conversations/:conversationId/messages - Get all messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }

    try {
        const conversation = await Conversation.findById(conversationId).lean();

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const messages = await Message.find({ conversationId: conversationId })
            .sort({ createdAt: 1 })
            .lean();

        // Extract senderIds from conversation participants and messages
        const senderIds = Array.from(new Set([
            conversation.participants.map(p => p.toString()),
            messages.map(message => message.senderId.toString())
        ].flat()));

        // Fetch user images for all senders
        const users = await User.find({ _id: { $in: senderIds } }).select('profilePicture').lean();

        // Create a map of userId to user image data
        const userImages = {};
        users.forEach(user => {
            userImages[user._id.toString()] = user.profilePicture ? {
                data: user.profilePicture.data.toString('base64'),
                contentType: user.profilePicture.contentType
            } : null;
        });

        // Structure the response
        const response = {
            messages: messages,
            userImages: userImages
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/messages - Send a new message (handles text, image, and reply)
router.post('/', upload.single('image'), async (req, res) => {
    const { conversationId, content, replyToMessageId, userId: userIdString } = req.body; // Get userId from body

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const senderId = new mongoose.Types.ObjectId(userIdString);

    const imageFile = req.file;

    // Validate required fields: conversationId and EITHER content OR an image file
    if (!conversationId || (!content && !imageFile)) {
        return res.status(400).json({ message: 'Missing required fields: conversationId and either content or an image file' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }

    // Validate replyToMessageId if provided
    if (replyToMessageId && !mongoose.Types.ObjectId.isValid(replyToMessageId)) {
        return res.status(400).json({ message: 'Invalid replyToMessageId format' });
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

        // 3. Prepare message data
        const messageData = {
            conversationId: conversation._id,
            senderId: senderId,
            content: content, // Include text content if provided
            readBy: [senderId]
        };

        // Add image data if file exists
        if (imageFile) {
            messageData.image = {
                data: imageFile.buffer,
                contentType: imageFile.mimetype
            };
        }

        // Add replyToMessageId if provided and valid
        if (replyToMessageId) {
            // Optional: Verify the message being replied to exists and is in the same conversation
            const repliedMessage = await Message.findOne({
                _id: new mongoose.Types.ObjectId(replyToMessageId),
                conversationId: conversation._id
            });
            if (!repliedMessage) {
                return res.status(404).json({ message: 'Message being replied to not found in this conversation.' });
            }
            messageData.replyToMessageId = repliedMessage._id;
        }

        // 4. Create and save the new message
        const newMessage = new Message(messageData);
        await newMessage.save();

        // 5. Update the conversation's lastMessage
        conversation.lastMessage = {
            messageId: newMessage._id,
            senderId: senderId,
            senderUsername: sender.username,
            content: content ? content : (imageFile ? 'Image' : ''), // Show "Image" if no text
            hasImage: !!imageFile, // Set hasImage flag
            createdAt: newMessage.createdAt
        };
        await conversation.save();

        // Update user's conversationIds array
        await User.findByIdAndUpdate(senderId, { $addToSet: { conversationIds: conversationId } });

        // 6. Prepare and return the response (don't send image buffer back)
        const messageResponse = newMessage.toObject();
        if (messageResponse.image) {
            // Remove the large buffer data from the response
            delete messageResponse.image.data;
            // Optionally add a flag or URL placeholder if needed by the client
            messageResponse.hasImage = true;
        }

        return res.status(201).json(messageResponse);

    } catch (error) {
        console.error('Failed to send message:', error);
        // Handle multer errors specifically (like wrong file type)
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer error: ${error.message}` });
        } else if (error.message === 'Not an image! Please upload only images.') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/messages/:messageId/react - Add/Update/Remove a reaction to a message
router.post('/:messageId/react', async (req, res) => {
    const { messageId } = req.params;
    const { emoji, userId: userIdString } = req.body; // Get userId from body

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: 'Invalid message ID format' });
    }

    if (emoji && typeof emoji !== 'string') {
        return res.status(400).json({ message: 'Invalid emoji format' });
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is part of the conversation (optional, but good for security)
        const conversation = await Conversation.findOne({
            _id: message.conversationId,
            participants: userId
        });
        if (!conversation) {
            return res.status(403).json({ message: 'User is not a participant in this conversation.' });
        }

        const existingReactionIndex = message.reactions.findIndex(r => r.userId.equals(userId));

        if (existingReactionIndex > -1) {
            // User has an existing reaction
            if (emoji) {
                // Update reaction
                message.reactions[existingReactionIndex].emoji = emoji;
            } else {
                // Remove reaction
                message.reactions.splice(existingReactionIndex, 1);
            }
        } else if (emoji) {
            // Add new reaction
            message.reactions.push({ userId, emoji });
        }
        // If emoji is null and no existing reaction, do nothing

        await message.save();

        // Prepare response, exclude image data
        const messageResponse = message.toObject();
        if (messageResponse.image) {
            delete messageResponse.image.data;
            messageResponse.hasImage = true;
        }

        return res.status(200).json(messageResponse);

    } catch (error) {
        console.error('Failed to react to message:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/messages/:messageId/image - Endpoint to retrieve an image
router.get('/:messageId/image', async (req, res) => {
    try {
        const { messageId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }

        const message = await Message.findById(messageId).select('image');

        if (!message || !message.image || !message.image.data) {
            return res.status(404).json({ message: 'Image not found for this message' });
        }

        // Set the content type header and send the image buffer
        res.set('Content-Type', message.image.contentType);
        res.send(message.image.data);

    } catch (error) {
        console.error('Failed to retrieve message image:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/chats - Fetch conversations using embedded last message
router.get('/chats', async (req, res) => {
    const { userId: userIdString } = req.query; // Get userId from query

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
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