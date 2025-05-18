import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Story from '../model/story.mjs';
import User from '../model/user.mjs';

const router = express.Router();

// Configure multer for handling image uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// 1. POST /api/stories - Create a new story
router.post('/', upload.single('image'), async (req, res) => {
    const { userId: userIdString, title, caption } = req.body;
    
    // Validate user ID
    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Validate mandatory fields
    if (!title) {
        return res.status(400).json({ message: 'Story title is required' });
    }
    
    // Check for image
    if (!req.file) {
        return res.status(400).json({ message: 'Story image is required' });
    }
    
    try {
        const userId = new mongoose.Types.ObjectId(userIdString);
        
        // Verify user exists
        const user = await User.findById(userId).select('username').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create story object
        const story = new Story({
            userId,
            username: user.username,
            title,
            caption: caption || '',
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            viewers: [userId] // Creator always views their own story
        });
        
        // Save the story
        await story.save();
        
        // Format the response
        const storyResponse = story.toObject();
        // Don't send image binary data in response
        delete storyResponse.image.data;
        storyResponse.hasImage = true;
        
        return res.status(201).json(storyResponse);
    } catch (error) {
        console.error('Failed to create story:', error);
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `File upload error: ${error.message}` });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 2. GET /api/stories - Get stories from users the current user follows
router.get('/', async (req, res) => {
    const { userId: userIdString } = req.query;
    
    // Validate user ID
    if (!userIdString) {
        return res.status(400).json({ message: 'Missing userId in query parameters' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    try {
        const userId = new mongoose.Types.ObjectId(userIdString);
        
        // Find the user and get their following list
        const user = await User.findById(userId)
            .select('following')
            .lean();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get list of user IDs to fetch stories from (following + own stories)
        const relevantUserIds = [
            userId, // Include own stories
            ...(user.following || []) // Include stories from followed users
        ];
        
        // Get stories from the last 24 hours, sorted by newest first
        const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        
        const stories = await Story.find({
            userId: { $in: relevantUserIds },
            createdAt: { $gt: oneDayAgo }
        })
        .sort({ createdAt: -1 })
        .lean();
        
        // Format stories for response - don't include image binary data
        const formattedStories = stories.map(story => {
            const formattedStory = { ...story };
            if (formattedStory.image && formattedStory.image.data) {
                delete formattedStory.image.data;
                formattedStory.hasImage = true;
            }
            // Add a flag to indicate if the current user has viewed this story
            formattedStory.viewed = story.viewers.some(
                viewerId => viewerId.toString() === userIdString
            );
            return formattedStory;
        });
        
        return res.status(200).json(formattedStories);
    } catch (error) {
        console.error('Failed to fetch stories:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Additional route for viewing a story image
router.get('/:storyId/image', async (req, res) => {
    const { storyId } = req.params;
    const { userId } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
        return res.status(400).json({ message: 'Invalid story ID format' });
    }
    
    try {
        const story = await Story.findById(storyId);
        
        if (!story || !story.image || !story.image.data) {
            return res.status(404).json({ message: 'Story image not found' });
        }
        
        // If userId provided, add to viewers if not already there
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const viewerId = new mongoose.Types.ObjectId(userId);
            if (!story.viewers.includes(viewerId)) {
                story.viewers.push(viewerId);
                await story.save();
            }
        }
        
        // Set content type and return image
        res.set('Content-Type', story.image.contentType);
        return res.send(story.image.data);
    } catch (error) {
        console.error('Failed to fetch story image:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Additional route for marking a story as viewed
router.post('/:storyId/view', async (req, res) => {
    const { storyId } = req.params;
    const { userId: userIdString } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
        return res.status(400).json({ message: 'Invalid story ID format' });
    }
    
    if (!userIdString || !mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid or missing user ID' });
    }
    
    try {
        const userId = new mongoose.Types.ObjectId(userIdString);
        
        // Find story and update viewers if not already viewed
        const story = await Story.findByIdAndUpdate(
            storyId,
            { $addToSet: { viewers: userId } },
            { new: true }
        );
        
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        
        return res.status(200).json({ message: 'Story marked as viewed' });
    } catch (error) {
        console.error('Failed to update story view status:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
