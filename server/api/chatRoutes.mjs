import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Message from '../model/message.mjs';
import Conversation from '../model/conversation.mjs';
import User from '../model/user.mjs';

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// 1. GET /api/chats - Fetch all conversations for a user (optimized)
router.get('/', async (req, res) => {
    const { userId: userIdString } = req.query; // Get userId from query parameters

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const userId = new mongoose.Types.ObjectId(userIdString);

    try {
        // Find the user and populate the conversation IDs directly
        // This is more efficient as it fetches both user and conversations in one go
        const user = await User.findById(userId)
            .select('conversationIds')
            .populate({
                path: 'conversationIds',
                options: { sort: { updatedAt: -1 } } // Sort by most recent conversations
            })
            .lean();
        
        if (!user || !user.conversationIds || user.conversationIds.length === 0) {
            return res.status(200).json([]);
        }
        
        // Return the populated conversations directly
        return res.status(200).json(user.conversationIds);
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 2. GET /api/chats/:conversationId/messages - Get paginated messages for a conversation
router.get('/:conversationId/messages', async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    if (!userId) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    try {
        // Verify the user is a participant in the conversation
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: new mongoose.Types.ObjectId(userId)
        });
        
        if (!conversation) {
            return res.status(403).json({ message: 'User is not a participant in this conversation' });
        }
        
        // Get total message count for pagination info
        const totalMessages = await Message.countDocuments({
            conversationId: new mongoose.Types.ObjectId(conversationId)
        });
        
        // Get paginated messages for the conversation
        const messages = await Message.find({
            conversationId: new mongoose.Types.ObjectId(conversationId)
        })
        .sort({ createdAt: -1 }) // Newest messages first for efficient pagination
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'username profilePicture')
        .lean();
        
        // Format messages for response - don't include image binary data
        const formattedMessages = messages.map(message => {
            const msg = { ...message };
            if (msg.image) {
                delete msg.image.data;
                msg.hasImage = true;
            }
            return msg;
        });
        
        // Reverse messages to display in chronological order
        formattedMessages.reverse();
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalMessages / limit);
        const hasMore = page < totalPages;
        
        return res.status(200).json({
            messages: formattedMessages,
            pagination: {
                page,
                limit,
                totalMessages,
                totalPages,
                hasMore
            }
        });
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 3. POST /api/chats/messages - Send a new message
router.post('/messages', upload.single('image'), async (req, res) => {
    const { conversationId, content, replyToMessageId, userId: userIdString } = req.body;
    const imageFile = req.file;

    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const senderId = new mongoose.Types.ObjectId(userIdString);

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
        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: senderId
        });
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or user is not a participant' });
        }
        
        // Get sender info for last message data
        const sender = await User.findById(senderId).select('username').lean();
        
        if (!sender) {
            return res.status(404).json({ message: 'Sender user not found' });
        }

        // Create message data
        const messageData = {
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
            readBy: [senderId] // Mark as read by sender
        };
        
        // Add image if provided
        if (imageFile) {
            messageData.image = { 
                data: imageFile.buffer, 
                contentType: imageFile.mimetype 
            };
        }
        
        // Add reply reference if provided
        if (replyToMessageId) {
            const repliedMessage = await Message.findOne({
                _id: new mongoose.Types.ObjectId(replyToMessageId),
                conversationId: conversation._id
            });
            
            if (!repliedMessage) {
                return res.status(404).json({ message: 'Message being replied to not found in this conversation' });
            }
            
            messageData.replyToMessageId = repliedMessage._id;
        }

        // Create and save new message
        const newMessage = new Message(messageData);
        await newMessage.save();

        // Update conversation with last message data
        conversation.lastMessage = {
            messageId: newMessage._id,
            senderId: senderId,
            senderUsername: sender.username,
            content: content ? content : (imageFile ? 'Image' : ''),
            hasImage: !!imageFile,
            createdAt: newMessage.createdAt
        };
        
        await conversation.save();        // Format message data for response (without image binary data)
        const messageResponse = newMessage.toObject();
        if (messageResponse.image) {
            delete messageResponse.image.data;
            messageResponse.hasImage = true;
        }
        
        // Get WebSocket service to notify participants
        const webSocketService = req.app.get('webSocketService');
        
        // Send real-time notification to all other participants
        if (webSocketService) {
            const participantIds = conversation.participants.map(p => p.toString());
            webSocketService.broadcastToConversation(
                conversation._id.toString(),
                participantIds,
                {
                    type: 'new_message',
                    conversationId: conversation._id.toString(),
                    message: messageResponse
                },
                senderId.toString() // Don't send to the sender
            );
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

// 4. POST /api/chats/messages/:messageId/react - Add/Update/Remove a reaction to a message
router.post('/messages/:messageId/react', async (req, res) => {
    const { messageId } = req.params;
    const { emoji, userId: userIdString } = req.body;

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
        // Find the message
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        // Verify the user is a participant in the conversation
        const conversation = await Conversation.findOne({
            _id: message.conversationId,
            participants: userId
        });
        
        if (!conversation) {
            return res.status(403).json({ message: 'User is not a participant in this conversation' });
        }

        // Handle reaction add/update/remove
        const existingReactionIndex = message.reactions.findIndex(r => r.userId.equals(userId));
        
        if (existingReactionIndex > -1) {
            // User has an existing reaction
            if (emoji) {
                // Update reaction
                message.reactions[existingReactionIndex].emoji = emoji;
            } else {
                // Remove reaction (unreact)
                message.reactions.splice(existingReactionIndex, 1);
            }
        } else if (emoji) {
            // Add new reaction
            message.reactions.push({ userId, emoji });
        }
        
        await message.save();

        // Return message data (without image binary data)
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

// 5. POST /api/chats/conversations - Create a new conversation
router.post('/conversations', async (req, res) => {
    const { userId, participantIds } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: 'At least one valid participant ID is required' });
    }
    
    // Validate all participant IDs
    const allParticipantIds = [userId, ...participantIds];
    for (const id of allParticipantIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid user ID format: ${id}` });
        }
    }
    
    // Convert to ObjectIds
    const participantObjectIds = allParticipantIds.map(id => new mongoose.Types.ObjectId(id));
    
    try {
        // Check if all users exist
        const users = await User.find({ _id: { $in: participantObjectIds } });
        
        if (users.length !== allParticipantIds.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }
        
        // For direct messages (2 participants), check if conversation already exists
        if (participantObjectIds.length === 2) {
            const existingConversation = await Conversation.findOne({
                participants: { $all: participantObjectIds },
                $expr: { $eq: [{ $size: "$participants" }, 2] } // Ensure exactly 2 participants
            });
              if (existingConversation) {
                // Ensure all users have this conversation in their conversationIds
                await User.updateMany(
                    { _id: { $in: participantObjectIds } },
                    { $addToSet: { conversationIds: existingConversation._id } }
                );
                
                return res.status(200).json(existingConversation);
            }
        }
        
        // Create new conversation
        const newConversation = new Conversation({
            participants: participantObjectIds,
            isGroupChat: participantObjectIds.length > 2
        });
        
        await newConversation.save();
        
        // Update all users' conversationIds
        // This ensures the conversationIds array in the user schema is properly maintained
        await User.updateMany(
            { _id: { $in: participantObjectIds } },
            { $addToSet: { conversationIds: newConversation._id } }
        );
        
        return res.status(201).json(newConversation);
    } catch (error) {
        console.error('Failed to create conversation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 6. PUT /api/chats/:conversationId/participants - Add or remove participants from a conversation
router.put('/:conversationId/participants', async (req, res) => {
    const { conversationId } = req.params;
    const { userId, addParticipantIds = [], removeParticipantIds = [] } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }
    
    // Validate add and remove arrays
    if (!Array.isArray(addParticipantIds) || !Array.isArray(removeParticipantIds)) {
        return res.status(400).json({ message: 'addParticipantIds and removeParticipantIds must be arrays' });
    }
    
    // Validate participant IDs
    for (const id of [...addParticipantIds, ...removeParticipantIds]) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid user ID format: ${id}` });
        }
    }
    
    try {
        // Check if conversation exists and user is a participant
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: new mongoose.Types.ObjectId(userId)
        });
        
        if (!conversation) {
            return res.status(403).json({ message: 'Conversation not found or user is not a participant' });
        }
        
        // Process additions
        if (addParticipantIds.length > 0) {
            const addParticipantObjectIds = addParticipantIds.map(id => new mongoose.Types.ObjectId(id));
            
            // Check if users exist
            const usersToAdd = await User.find({ _id: { $in: addParticipantObjectIds } });
            if (usersToAdd.length !== addParticipantIds.length) {
                return res.status(404).json({ message: 'One or more users to add not found' });
            }
            
            // Add to conversation
            await Conversation.findByIdAndUpdate(
                conversationId,
                { $addToSet: { participants: { $each: addParticipantObjectIds } } }
            );
            
            // Update users' conversationIds
            await User.updateMany(
                { _id: { $in: addParticipantObjectIds } },
                { $addToSet: { conversationIds: new mongoose.Types.ObjectId(conversationId) } }
            );
        }
        
        // Process removals
        if (removeParticipantIds.length > 0) {
            const removeParticipantObjectIds = removeParticipantIds.map(id => new mongoose.Types.ObjectId(id));
            
            // Prevent removing the requesting user
            if (removeParticipantIds.includes(userId)) {
                return res.status(400).json({ message: 'Cannot remove yourself via this endpoint' });
            }
            
            // Ensure we don't end up with an empty conversation
            const updatedConversation = await Conversation.findById(conversationId);
            if (updatedConversation.participants.length - removeParticipantIds.length < 2) {
                return res.status(400).json({ message: 'Cannot remove participants such that fewer than 2 remain' });
            }
            
            // Remove from conversation
            await Conversation.findByIdAndUpdate(
                conversationId,
                { $pull: { participants: { $in: removeParticipantObjectIds } } }
            );
            
            // Update users' conversationIds
            await User.updateMany(
                { _id: { $in: removeParticipantObjectIds } },
                { $pull: { conversationIds: new mongoose.Types.ObjectId(conversationId) } }
            );
        }
          // Return updated conversation
        const updatedConversation = await Conversation.findById(conversationId).lean();
        return res.status(200).json(updatedConversation);
    } catch (error) {
        console.error('Failed to update conversation participants:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 7. DELETE /api/chats/:conversationId - Delete a conversation
router.delete('/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.query; // Get userId from query parameters
    
    if (!userId) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }
    
    try {
        // Find the conversation and check if user is a participant
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: new mongoose.Types.ObjectId(userId)
        });
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or user is not a participant' });
        }
        
        // Get all participants before deleting the conversation
        const participantIds = conversation.participants;
        
        // Delete all messages in the conversation
        await Message.deleteMany({ conversationId: new mongoose.Types.ObjectId(conversationId) });
        
        // Delete the conversation
        await Conversation.findByIdAndDelete(conversationId);
        
        // Update all participants' conversationIds arrays
        await User.updateMany(
            { _id: { $in: participantIds } },
            { $pull: { conversationIds: new mongoose.Types.ObjectId(conversationId) } }
        );
        
        return res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 8. GET /api/chats/:conversationId/profilepicture - Get profile picture of a user(s) in a conversation
router.get('/:conversationId/profilepicture', async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.query; // Get userId from query parameters

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format' });
    }
    
    try {
        // Find the conversation and check if user is a participant
        const conversation = await Conversation.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: new mongoose.Types.ObjectId(userId)
        }).populate('participants', 'profilePicture').lean();
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or user is not a participant' });
        }
        
        // Extract profile pictures of participants
        const profilePictures = conversation.participants.map(participant => ({
            userId: participant._id,
            profilePicture: participant.profilePicture
        }));
        
        return res.status(200).json(profilePictures);
    } catch (error) {
        console.error('Failed to fetch profile pictures:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
