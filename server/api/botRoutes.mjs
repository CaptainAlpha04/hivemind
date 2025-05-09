import express from 'express';
import mongoose from 'mongoose';
import Bot from '../model/bot.mjs';
import User from '../model/user.mjs';

const router = express.Router();

// GET /api/bots - Get all public bots (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bots = await Bot.find({ 
            visibility: 'public',
            isActive: true 
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-personality') // Exclude the full personality JSON for list view
        .lean();

        const total = await Bot.countDocuments({ 
            visibility: 'public',
            isActive: true 
        });

        return res.status(200).json({
            bots,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Failed to fetch bots:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/bots/:botId - Get a specific bot by ID
router.get('/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid bot ID format' });
        }

        const bot = await Bot.findById(botId).lean();
        
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }

        // Check visibility restrictions
        const session = req.auth;
        const userIdString = session?.user?.id ?? session?.user?.sub;
        
        if (bot.visibility !== 'public') {
            // For private or followers_only bots, check authentication
            if (!session || !userIdString) {
                return res.status(401).json({ message: 'Authentication required to view this bot' });
            }

            const userId = new mongoose.Types.ObjectId(userIdString);
            
            // If private, only the creator can see it
            if (bot.visibility === 'private' && !bot.createdBy.equals(userId)) {
                return res.status(403).json({ message: 'You do not have permission to view this bot' });
            }
            
            // If followers_only, need to check if user is following the bot creator
            // This would require additional logic and a follow relationship model
            // For now, we'll just allow it (simplified)
        }
        
        return res.status(200).json(bot);
    } catch (error) {
        console.error('Failed to fetch bot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/bots - Create a new bot
router.post('/', async (req, res) => {
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
        // Verify the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user already has a bot (optional, depends on your requirements)
        const existingBot = await Bot.findOne({ userId: userId });
        if (existingBot) {
            return res.status(409).json({ 
                message: 'User already has a bot. Please update the existing bot instead.',
                botId: existingBot._id
            });
        }
        
        // Required fields validation
        const { name, age, gender, personality } = req.body;
        
        if (!name || !age || !gender || !personality) {
            return res.status(400).json({ message: 'Missing required fields: name, age, gender, and personality are required' });
        }
        
        // Create and save the new bot
        const newBot = new Bot({
            ...req.body,
            userId: userId,
            createdBy: userId,
            lastActiveAt: new Date()
        });
        
        await newBot.save();
        
        return res.status(201).json(newBot);
    } catch (error) {
        console.error('Failed to create bot:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {})
            });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /api/bots/:botId - Update a bot
router.put('/:botId', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userId = new mongoose.Types.ObjectId(userIdString);
    const { botId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(botId)) {
        return res.status(400).json({ message: 'Invalid bot ID format' });
    }
    
    try {
        // Find the bot and check ownership
        const bot = await Bot.findById(botId);
        
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }
        
        if (!bot.createdBy.equals(userId)) {
            return res.status(403).json({ message: 'You do not have permission to update this bot' });
        }
        
        // Don't allow changing the userId or createdBy fields
        const {
            userId: newUserId, 
            createdBy,
            interactionCount,
            ...updateData
        } = req.body;
        
        // Update the bot
        Object.assign(bot, updateData);
        await bot.save();
        
        return res.status(200).json(bot);
    } catch (error) {
        console.error('Failed to update bot:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {})
            });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /api/bots/:botId - Delete (or deactivate) a bot
router.delete('/:botId', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userId = new mongoose.Types.ObjectId(userIdString);
    const { botId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(botId)) {
        return res.status(400).json({ message: 'Invalid bot ID format' });
    }
    
    try {
        // Find the bot and check ownership
        const bot = await Bot.findById(botId);
        
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found' });
        }
        
        if (!bot.createdBy.equals(userId)) {
            return res.status(403).json({ message: 'You do not have permission to delete this bot' });
        }
        
        // Option 1: Permanently delete
        // await Bot.deleteOne({ _id: botId });
        
        // Option 2: Soft delete (recommended to maintain data integrity)
        bot.isActive = false;
        await bot.save();
        
        return res.status(200).json({ message: 'Bot successfully deactivated' });
    } catch (error) {
        console.error('Failed to delete bot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/bots/:botId/interact - Handle interaction with a bot
router.post('/:botId/interact', async (req, res) => {
    try {
        const { botId } = req.params;
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(botId)) {
            return res.status(400).json({ message: 'Invalid bot ID format' });
        }
        
        // Find the bot
        const bot = await Bot.findOne({
            _id: botId,
            isActive: true
        });
        
        if (!bot) {
            return res.status(404).json({ message: 'Bot not found or inactive' });
        }
        
        // Check visibility restrictions
        const session = req.auth;
        const userIdString = session?.user?.id ?? session?.user?.sub;
        
        if (bot.visibility !== 'public') {
            // For private or followers_only bots, check authentication
            if (!session || !userIdString) {
                return res.status(401).json({ message: 'Authentication required to interact with this bot' });
            }
            
            const userId = new mongoose.Types.ObjectId(userIdString);
            
            // If private, only the creator can interact
            if (bot.visibility === 'private' && !bot.createdBy.equals(userId)) {
                return res.status(403).json({ message: 'You do not have permission to interact with this bot' });
            }
            
            // If followers_only, need to check if user is following the bot creator
            // This would require additional logic and a follow relationship model
            // For now, we'll just allow it (simplified)
        }
        
        // Process the interaction with the bot
        // This is a placeholder - you would integrate with your AI system here
        const botResponse = `This is a simulated response from ${bot.name}. In a real implementation, this would use the bot's personality settings and AI model.`;
        
        // Update the bot's interaction count and last active time
        bot.interactionCount += 1;
        bot.lastActiveAt = new Date();
        await bot.save();
        
        return res.status(200).json({
            botId: bot._id,
            botName: bot.name,
            message: message,
            response: botResponse,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to process bot interaction:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;