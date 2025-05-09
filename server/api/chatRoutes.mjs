import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Message from '../model/message.mjs';
import Conversation from '../model/conversation.mjs';
import User from '../model/user.mjs';

const router = express.Router();

// Multer configuration (as it was in messageRoutes.mjs)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// === CONVERSATION ROUTES ===

// GET /api/chats - Fetch conversations for the logged-in user
router.get('/', async (req, res) => { // Changed from /chats to / to match new mounting point
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
        const user = await User.findById(userId).select('conversationIds').lean();
        if (!user || !user.conversationIds || user.conversationIds.length === 0) {
            return res.status(200).json([]);
        }
        const conversations = await Conversation.find({
            _id: { $in: user.conversationIds }
        })
        .sort({ updatedAt: -1 })
        .lean();
        return res.status(200).json(conversations);
    } catch (error) {
        console.error('Failed to fetch chats:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// === MESSAGE ROUTES ===

// POST /api/chats/messages - Send a new message
router.post('/messages', upload.single('image'), async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const senderId = new mongoose.Types.ObjectId(userIdString);
    const { conversationId, content, replyToMessageId } = req.body;
    const imageFile = req.file;

    if (!conversationId || (!content && !imageFile)) {
        return res.status(400).json({ message: 'Missing required fields: conversationId and either content or an image file' });
    }
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }
    if (replyToMessageId && !mongoose.Types.ObjectId.isValid(replyToMessageId)) {
        return res.status(400).json({ message: 'Invalid replyToMessageId format' });
    }

    try {
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: senderId
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or user is not a participant.' });
        }
        const sender = await User.findById(senderId).select('username').lean();
        if (!sender) {
            return res.status(404).json({ message: 'Sender user not found.' });
        }

        const messageData = {
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
            readBy: [senderId]
        };
        if (imageFile) {
            messageData.image = { data: imageFile.buffer, contentType: imageFile.mimetype };
        }
        if (replyToMessageId) {
            const repliedMessage = await Message.findOne({
                _id: new mongoose.Types.ObjectId(replyToMessageId),
                conversationId: conversation._id
            });
            if (!repliedMessage) {
                return res.status(404).json({ message: 'Message being replied to not found in this conversation.' });
            }
            messageData.replyToMessageId = repliedMessage._id;
        }

        const newMessage = new Message(messageData);
        await newMessage.save();

        conversation.lastMessage = {
            messageId: newMessage._id,
            senderId: senderId,
            senderUsername: sender.username,
            content: content ? content : (imageFile ? 'Image' : ''),
            hasImage: !!imageFile,
            createdAt: newMessage.createdAt
        };
        await conversation.save();

        const messageResponse = newMessage.toObject();
        if (messageResponse.image) {
            delete messageResponse.image.data;
            messageResponse.hasImage = true;
        }
        return res.status(201).json(messageResponse);
    } catch (error) {
        console.error('Failed to send message:', error);
        if (error instanceof multer.MulterError) {
             return res.status(400).json({ message: `Multer error: ${error.message}` });
        } else if (error.message === 'Not an image! Please upload only images.') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/chats/messages/:messageId/react - Add/Update/Remove a reaction to a message
router.post('/messages/:messageId/react', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;
    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);
    const { messageId } = req.params;
    const { emoji } = req.body;

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
        const conversation = await Conversation.findOne({
            _id: message.conversationId,
            participants: userId
        });
        if (!conversation) {
            return res.status(403).json({ message: 'User is not a participant in this conversation.' });
        }

        const existingReactionIndex = message.reactions.findIndex(r => r.userId.equals(userId));
        if (existingReactionIndex > -1) {
            if (emoji) {
                message.reactions[existingReactionIndex].emoji = emoji;
            } else {
                message.reactions.splice(existingReactionIndex, 1);
            }
        } else if (emoji) {
            message.reactions.push({ userId, emoji });
        }
        await message.save();

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

// GET /api/chats/messages/:messageId/image - Endpoint to retrieve an image for a message
router.get('/messages/:messageId/image', async (req, res) => {
    try {
        const { messageId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }
        const message = await Message.findById(messageId).select('image');
        if (!message || !message.image || !message.image.data) {
            return res.status(404).json({ message: 'Image not found for this message' });
        }
        res.set('Content-Type', message.image.contentType);
        res.send(message.image.data);
    } catch (error) {
        console.error('Failed to retrieve message image:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
