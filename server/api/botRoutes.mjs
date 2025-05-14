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

        return res.status(200).json(bot);
    } catch (error) {
        console.error('Failed to fetch bot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


// POST /api/bots - Create a new bot
router.post('/', async (req, res) => {
    try {
        // Required fields validation based on both user and bot schemas
        const { name, email, username, age, gender, personality } = req.body;
        
        if (!name || !email || !username || !age || !gender) {
            return res.status(400).json({ 
                message: 'Missing required fields: name, email, username, age, and gender are required'
            });
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Username already exists. Please choose a different username.'
            });
        }
        
        // Generate new unique ID to be used for both user and bot
        const botId = new mongoose.Types.ObjectId();
        
        // Create a new user for the bot
        const botUser = new User({
            _id: botId,
            name,
            email,
            username,
            password: botId.toString(), // Use the bot ID as password
            bio: req.body.bio || `I am ${name}, a bot.`,
            isBot: true,
            verified: true // Auto-verify bots
        });
        
        // Create the bot with all fields from request body
        const newBot = new Bot({
            _id: botId,
            userId: botId, // Link to the user account
            name,
            username,
            age,
            gender,
            nationality: req.body.nationality,
            ethnicity: req.body.ethnicity,
            culturalBackground: req.body.culturalBackground,
            occupation: req.body.occupation,
            education: req.body.education,
            skills: req.body.skills || [],
            hobbies: req.body.hobbies || [],
            interests: req.body.interests || [],
            physicalDescription: {
                build: req.body.physicalDescription?.build || 'Average',
                height: req.body.physicalDescription?.height || 'Medium',
                hair: req.body.physicalDescription?.hair,
                eyes: req.body.physicalDescription?.eyes,
                distinguishingFeatures: req.body.physicalDescription?.distinguishingFeatures || 'None',
                style: req.body.physicalDescription?.style
            },
            profilePicture: req.body.profilePicture,
            generalDisposition: req.body.generalDisposition,
            religionBeliefs: req.body.religionBeliefs,
            personalityType: req.body.personalityType,
            keyPersonalityTraits: req.body.keyPersonalityTraits || [],
            strengths: req.body.strengths || [],
            weaknesses: req.body.weaknesses || [],
            communicationStyle: req.body.communicationStyle,
            valuesAndCoreBeliefs: req.body.valuesAndCoreBeliefs || [],
            aspirationsAndGoals: req.body.aspirationsAndGoals || [],
            challengesAndStruggles: req.body.challengesAndStruggles || [],
            familyDetails: {
                maritalStatus: req.body.familyDetails?.maritalStatus,
                spousePartner: req.body.familyDetails?.spousePartner || 'None',
                children: req.body.familyDetails?.children || [],
                parentsStatus: req.body.familyDetails?.parentsStatus,
                siblings: req.body.familyDetails?.siblings || [],
                relationshipWithFamily: req.body.familyDetails?.relationshipWithFamily
            },
            socialCircle: req.body.socialCircle,
            dailyLifeSnippet: req.body.dailyLifeSnippet,
            quirksAndHabits: req.body.quirksAndHabits || [],
            briefBackstory: req.body.briefBackstory,
            visibility: req.body.visibility || 'public',
            lastActiveAt: new Date()
        });

        // Save both documents
        await botUser.save();
        await newBot.save();
        
        // Return the created bot and user (excluding sensitive fields)
        return res.status(201).json({
            success: true,
            message: 'Bot and associated user account created successfully',
            bot: newBot,
            botUser: {
                _id: botUser._id,
                name: botUser.name,
                username: botUser.username,
                email: botUser.email,
                isBot: botUser.isBot
            }
        });
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
        
        // Check for duplicate key errors (like username/email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
            });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


// PUT /api/bots/:botId - Update a bot
router.put('/:botId', async (req, res) => {
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