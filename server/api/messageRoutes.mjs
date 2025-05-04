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

// POST /api/messages - Send a new message (handles text and image)
// Use upload.single('image') middleware
router.post('/', upload.single('image'), async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const senderId = new mongoose.Types.ObjectId(userIdString);

    const { conversationId, content } = req.body; // Get content from body
    const imageFile = req.file; // Get file from req.file added by multer

    // Validate required fields: conversationId and EITHER content OR an image file
    if (!conversationId || (!content && !imageFile)) {
        return res.status(400).json({ message: 'Missing required fields: conversationId and either content or an image file' });
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


export default router;
