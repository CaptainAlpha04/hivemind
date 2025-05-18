import express from 'express';
import mongoose from 'mongoose';
import Community from '../model/community.mjs';
import Post from '../model/post.mjs';
import User from '../model/user.mjs'; // Needed for adding user to community members/moderators
import multer from 'multer'; // Assuming you are using multer for file uploads

const router = express.Router();
const upload = multer(); // Configure multer for file uploads

// --- Community Management Endpoints ---

// POST /api/communities - Create a new community
router.post('/', upload.fields([
    { name: 'profilePicture', maxCount: 1 }, // Assuming you want to upload a profile picture
    { name: 'bannerImage', maxCount: 1 } // Assuming you want to upload a banner image
]) ,async (req, res) => {
    const { name, description, isPrivate, userId } = req.body;
    const creatorId = userId;

    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        return res.status(401).json({ message: 'User not authenticated or invalid ID' });
    }

    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
    }

    try {
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return res.status(400).json({ message: 'A community with this name already exists' });
        }

        const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0] : null;
        const bannerImage = req.files['bannerImage'] ? req.files['bannerImage'][0] : null;

        const community = new Community({
            name,
            description,
            creator: creatorId,
            isPrivate: isPrivate === 'true', // Convert string to boolean
            // moderators and members will be automatically populated with creator via schema pre-save hook
            profilePicture: profilePicture ? {
                data: profilePicture.buffer,
                contentType: profilePicture.mimetype
            } : null,

            bannerImage: bannerImage ? {
                data: bannerImage.buffer,
                contentType: bannerImage.mimetype
            } : null
        });

        await community.save();

        // Add community to creator's list of communities and moderatedCommunities
        await User.findByIdAndUpdate(creatorId, {
            $addToSet: { communities: community._id, moderatedCommunities: community._id }
        });

        res.status(201).json(community);
    } catch (error) {
        console.error('Error creating community:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/communities - Get all public communities (or communities user is part of if private)
// Modified to accept a 'search' query parameter
router.get('/', async (req, res) => {
    const { search, userId } = req.query; // Get search query from request

    try {
        // Base query for public communities
        let queryConditions = { isPrivate: false };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            // If user "context" is present, include private communities they are a member of
            queryConditions = {
                $or: [
                    { isPrivate: false },
                    { isPrivate: true, members: userId }
                ]
            };
        }

        // If a search query is provided, add text search to the conditions
        if (search && typeof search === 'string' && search.trim() !== '') {
            const searchQuery = { $text: { $search: search.trim() } };
            // If queryConditions already has $or, we need to combine with $and
            if (queryConditions.$or) {
                queryConditions = {
                    $and: [
                        { $or: queryConditions.$or },
                        searchQuery
                    ]
                };
            } else { // Otherwise, just add the text search
                queryConditions = { ...queryConditions, ...searchQuery };
            }
        }

        const communities = await Community.find(queryConditions)
            .populate('creator', 'username profilePicture') // Populate creator with specific fields
            .select('-members -moderators -posts -rules'); // Exclude sensitive/large fields for listing

        res.status(200).json(communities);
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/communities/:userId - Get communities for a specific user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        const user = await User.findById(userId).populate('communities', 'name description isPrivate profilePicture bannerImage');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const communities = user.communities.map(community => ({
            _id: community._id,
            name: community.name,
            description: community.description,
            isPrivate: community.isPrivate,
            profilePicture: community.profilePicture,
            bannerImage: community.bannerImage
        }));
        res.status(200).json(communities);
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// GET /api/communities/:communityId - Get a specific community by ID
router.get('/:communityId', async (req, res) => {
    const { communityId } = req.params;
    const userId = req.query.userId; // Using req.query.userId due to auth removal

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID format' });
    }

    try {
        const community = await Community.findById(communityId)
            .populate('creator', 'username profilePicture')
            .populate('moderators', 'username profilePicture');
            // .populate('members', 'username profilePicture'); // Potentially large, consider pagination

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check for private community access
        if (community.isPrivate) {
            if (!userId || !community.members.some(memberId => memberId.equals(userId))) {
                return res.status(403).json({ message: 'You do not have permission to view this private community' });
            }
        }

        // Create a response object that includes all necessary data
        const communityResponse = community.toObject();
        
        // Instead of replacing with URLs, keep the original data for frontend
        // and just add user-specific flags
        if (userId) {
            communityResponse.isMember = community.members.some(id => id.toString() === userId);
            communityResponse.isModerator = community.moderators.some(id => id.toString() === userId);
            communityResponse.isCreator = community.creator.toString() === userId;
        }

        res.status(200).json(communityResponse);
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// --- Community Membership Endpoints ---

// POST /api/communities/:communityId/join - Join a community
router.post('/:communityId/join', async (req, res) => {
    const { communityId } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the request body

    if (!mongoose.Types.ObjectId.isValid(communityId)) { // Removed userId validation as it's optional now
        return res.status(400).json({ message: 'Invalid community ID format' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { // Check if userId is present for this action
        return res.status(401).json({ message: 'User ID is required to join a community.' });
    }

    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.isPrivate) {
            // For private communities, implement an approval system or invite-only
            return res.status(403).json({ message: 'Cannot join a private community directly. Request an invite or approval.' });
        }

        if (community.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a member of this community' });
        }

        community.members.push(userId);
        await community.save();

        await User.findByIdAndUpdate(userId, { $addToSet: { communities: communityId } });

        res.status(200).json({ message: 'Successfully joined community', community });
    } catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fix the leave community route

// POST /api/communities/:communityId/leave - Leave a community
router.post('/:communityId/leave', async (req, res) => {
    const { communityId } = req.params;
    const { userId } = req.body; // Get userId from req.body

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID format' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: 'User ID is required to leave a community.' });
    }

    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.creator.equals(userId)) {
            return res.status(400).json({ message: 'Creator cannot leave the community. Consider deleting or transferring ownership.'});
        }

        // Find index of user in members array
        const memberIndex = community.members.findIndex(id => id.toString() === userId);
        if (memberIndex === -1) {
            return res.status(400).json({ message: 'User is not a member of this community' });
        }

        // Remove from members array
        community.members.splice(memberIndex, 1);
        
        // Also remove from moderators if they were one (and not the creator)
        const moderatorIndex = community.moderators.findIndex(id => id.toString() === userId);
        if (moderatorIndex > -1 && !community.creator.equals(userId)) {
            community.moderators.splice(moderatorIndex, 1);
        }
        
        await community.save();

        // Remove community from user's communities and moderatedCommunities arrays
        await User.findByIdAndUpdate(userId, { 
            $pull: { 
                communities: communityId, 
                moderatedCommunities: communityId 
            } 
        });

        res.status(200).json({ 
            message: 'Successfully left community', 
            communityId: community._id 
        });
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add moderator management routes

// POST /api/communities/:communityId/moderators - Add a moderator
router.post('/:communityId/moderators', async (req, res) => {
    const { communityId } = req.params;
    const { userId, newModeratorId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(communityId) || 
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(newModeratorId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if user is authorized (creator or moderator)
        if (!community.creator.equals(userId) && !community.moderators.some(id => id.equals(userId))) {
            return res.status(403).json({ message: 'You do not have permission to add moderators' });
        }
        
        // Check if target user is a member
        if (!community.members.some(id => id.equals(newModeratorId))) {
            return res.status(400).json({ message: 'User must be a member to become a moderator' });
        }
        
        // Check if target is already a moderator
        if (community.moderators.some(id => id.equals(newModeratorId))) {
            return res.status(400).json({ message: 'User is already a moderator' });
        }
        
        // Add user to moderators
        community.moderators.push(newModeratorId);
        await community.save();
        
        // Add community to user's moderated communities
        await User.findByIdAndUpdate(newModeratorId, {
            $addToSet: { moderatedCommunities: communityId }
        });
        
        res.status(200).json({ 
            message: 'Successfully added moderator', 
            communityId: community._id 
        });
    } catch (error) {
        console.error('Error adding moderator:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add community edit functionality

// PUT /api/communities/:communityId - Update community details
router.put('/:communityId', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
    const { communityId } = req.params;
    const { name, description, isPrivate, userId, rules } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(communityId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if user is authorized (creator or moderator)
        if (!community.creator.equals(userId) && !community.moderators.some(id => id.equals(userId))) {
            return res.status(403).json({ message: 'You do not have permission to edit this community' });
        }
        
        // Update fields if provided
        if (name) community.name = name;
        if (description) community.description = description;
        if (isPrivate !== undefined) {
            // Only creator can change privacy setting
            if (community.creator.equals(userId)) {
                community.isPrivate = isPrivate;
            } else {
                return res.status(403).json({ message: 'Only the creator can change privacy settings' });
            }
        }
        
        // Update rules if provided
        if (rules && Array.isArray(JSON.parse(rules))) {
            community.rules = JSON.parse(rules);
        }
        
        // Update profile picture if provided
        if (req.files && req.files['profilePicture'] && req.files['profilePicture'][0]) {
            community.profilePicture = {
                data: req.files['profilePicture'][0].buffer,
                contentType: req.files['profilePicture'][0].mimetype
            };
        }
        
        // Update banner image if provided
        if (req.files && req.files['bannerImage'] && req.files['bannerImage'][0]) {
            community.bannerImage = {
                data: req.files['bannerImage'][0].buffer,
                contentType: req.files['bannerImage'][0].mimetype
            };
        }
        
        await community.save();
        
        // Create response without binary data
        const communityResponse = community.toObject();
        if (communityResponse.profilePicture && communityResponse.profilePicture.data) {
            communityResponse.profilePictureUrl = `/api/communities/${communityId}/profile-picture`;
            delete communityResponse.profilePicture.data;
        }
        if (communityResponse.bannerImage && communityResponse.bannerImage.data) {
            communityResponse.bannerImageUrl = `/api/communities/${communityId}/banner`;
            delete communityResponse.bannerImage.data;
        }
        
        res.status(200).json({
            message: 'Community updated successfully',
            community: communityResponse
        });
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /api/communities/:communityId/moderators/:moderatorId - Remove a moderator
router.delete('/:communityId/moderators/:moderatorId', async (req, res) => {
    const { communityId, moderatorId } = req.params;
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(communityId) || 
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(moderatorId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if user is authorized (creator or the moderator removing themselves)
        if (!community.creator.equals(userId) && !userId.equals(moderatorId)) {
            return res.status(403).json({ message: 'You do not have permission to remove this moderator' });
        }
        
        // Cannot remove creator from moderators
        if (community.creator.equals(moderatorId)) {
            return res.status(400).json({ message: 'Cannot remove creator from moderators' });
        }
        
        // Check if target is a moderator
        const moderatorIndex = community.moderators.findIndex(id => id.equals(moderatorId));
        if (moderatorIndex === -1) {
            return res.status(400).json({ message: 'User is not a moderator' });
        }
        
        // Remove user from moderators
        community.moderators.splice(moderatorIndex, 1);
        await community.save();
        
        // Remove community from user's moderated communities
        await User.findByIdAndUpdate(moderatorId, {
            $pull: { moderatedCommunities: communityId }
        });
        
        res.status(200).json({ 
            message: 'Successfully removed moderator', 
            communityId: community._id 
        });
    } catch (error) {
        console.error('Error removing moderator:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- Community Posts Endpoints ---

// GET /api/communities/:communityId/posts - Get all posts for a specific community
router.get('/:communityId/posts', async (req, res) => {
    const { communityId } = req.params;
    const userId = req.query.userId; // Using req.query.userId due to auth removal

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID format' });
    }

    try {
        const community = await Community.findById(communityId).select('isPrivate members'); // Select only necessary fields
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check access for private communities
        if (community.isPrivate) {
            if (!userId || !community.members.some(memberId => memberId.equals(userId))) {
                return res.status(403).json({ message: 'You do not have permission to view posts in this private community' });
            }
        }

        // Fetch posts that belong to this community and have visibility 'community_only' or 'public' (if you want public posts to also appear here)
        // For strict community-only posts:
        const posts = await Post.find({
            community: communityId,
            // visibility: 'community_only' // Uncomment if posts *must* be marked community_only
            // Or, if public posts can also be associated and shown within a community context:
            $or: [
                { community: communityId, visibility: 'community_only' },
                // { community: communityId, visibility: 'public' } // If public posts can also be listed under a community
            ]
        })
        .populate('userId', 'username profilePicture') // Populate post author details
        .populate('community', 'name') // Populate community name (optional, as we are in community context)
        .sort({ createdAt: -1 })
        .select('-images.data'); // Exclude image data for list view

        // Map posts to include hasImages similar to the main post feed
        const postsWithImageData = posts.map(post => {
            const postObject = post.toObject();
            postObject.hasImages = post.images && post.images.length > 0;
            if (postObject.images) {
                postObject.images = postObject.images.map(img => ({ contentType: img.contentType, _id: img._id }));
            }
            return postObject;
        });

        res.status(200).json(postsWithImageData);
    } catch (error) {
        console.error('Error fetching posts for community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/communities/:communityId/posts - Get all posts for a specific community
router.get('/:communityId/posts/', async (req, res) => {
    const { communityId } = req.params;
    const userId = req.query.userId; // Using req.query.userId due to auth removal

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID format' });
    }

    try {
        const community = await Community.findById(communityId).select('isPrivate members'); // Select only necessary fields
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check access for private communities
        if (community.isPrivate) {
            if (!userId || !community.members.some(memberId => memberId.equals(userId))) {
                return res.status(403).json({ message: 'You do not have permission to view posts in this private community' });
            }
        }

        // Fetch posts that belong to this community and have visibility 'community_only' or 'public' (if you want public posts to also appear here)
        // For strict community-only posts:
        const posts = await Post.find({
            community: communityId,
            // visibility: 'community_only' // Uncomment if posts *must* be marked community_only
            // Or, if public posts can also be associated and shown within a community context:
            $or: [
                { community: communityId, visibility: 'community_only' },
                // { community: communityId, visibility: 'public' } // If public posts can also be listed under a community
            ]
        })
        .populate('userId', 'username profilePicture') // Populate post author details
        .populate('community', 'name') // Populate community name (optional, as we are in community context)
        .sort({ createdAt: -1 })
        .select('-images.data'); // Exclude image data for list view

        // Map posts to include hasImages similar to the main post feed
        const postsWithImageData = posts.map(post => {
            const postObject = post.toObject();
            postObject.hasImages = post.images && post.images.length > 0;
            if (postObject.images) {
                postObject.images = postObject.images.map(img => ({ contentType: img.contentType, _id: img._id }));
            }
            return postObject;
        });

        res.status(200).json(postsWithImageData);
    } catch (error) {
        console.error('Error fetching posts for community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Note: Creating a post *within* a community would typically be handled by the existing
// POST /api/posts route, but you would modify it to accept an optional `communityId`
// in the request body. If `communityId` is provided and `visibility` is set to `community_only`,
// the post would be associated with that community.

export default router;
