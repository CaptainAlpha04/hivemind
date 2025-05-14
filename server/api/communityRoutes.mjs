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

        const profilePic = req.files['profilePic'] ? req.files['profilePic'][0] : null;
        const bannerImage = req.files['bannerImage'] ? req.files['bannerImage'][0] : null;

        const community = new Community({
            name,
            description,
            creator: creatorId,
            isPrivate: isPrivate || false,
            // moderators and members will be automatically populated with creator via schema pre-save hook
            profilePic: profilePic ? {
                data: profilePic.buffer,
                contentType: profilePic.mimetype
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

        res.status(200).json(community);
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- Community Membership Endpoints ---

// POST /api/communities/:communityId/join - Join a community
router.post('/:communityId/join', async (req, res) => {
    const { communityId, userId } = req.params;

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

// POST /api/communities/:communityId/leave - Leave a community
router.post('/:communityId/leave', async (req, res) => {
    const { communityId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) { // Removed userId validation
        return res.status(400).json({ message: 'Invalid community ID format' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { // Check if userId is present for this action
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

        const memberIndex = community.members.indexOf(userId);
        if (memberIndex === -1) {
            return res.status(400).json({ message: 'User is not a member of this community' });
        }

        community.members.splice(memberIndex, 1);
        // Also remove from moderators if they were one (and not the creator)
        const moderatorIndex = community.moderators.indexOf(userId);
        if (moderatorIndex > -1 && !community.creator.equals(userId)) {
            community.moderators.splice(moderatorIndex, 1);
        }
        await community.save();

        await User.findByIdAndUpdate(userId, { $pull: { communities: communityId, moderatedCommunities: communityId } });

        res.status(200).json({ message: 'Successfully left community', community });
    } catch (error) {
        console.error('Error leaving community:', error);
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
