import express from 'express';
import mongoose from 'mongoose';
import User from '../model/user.mjs';
import neo4jService from '../services/neo4jService.mjs';

const router = express.Router();

// PUT /api/users/settings - Update user settings
router.put('/settings', async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

    const { receiveEmailNotifications, theme } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only provided settings
        if (typeof receiveEmailNotifications === 'boolean') {
            user.settings.receiveEmailNotifications = receiveEmailNotifications;
        }
        if (theme && typeof theme === 'string') {
            user.settings.theme = theme;
        }

        await user.save();
        return res.status(200).json(user.settings);

    } catch (error) {
        console.error('Failed to update user settings:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/follow/:userId - Follow a user
router.post('/follow/:userId', async (req, res) => {
    const session = req.auth;
    const followerId = session?.user?.id ?? session?.user?.sub;

    if (!session || !followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { userId: followeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(followeeId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    if (followerId === followeeId) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    try {
        // Update MongoDB
        const follower = await User.findById(followerId);
        const followee = await User.findById(followeeId);

        if (!follower || !followee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (follower.following && follower.following.some(id => id.toString() === followeeId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following array
        if (!follower.following) follower.following = [];
        follower.following.push(followeeId);
        follower.followingCount = follower.following.length;
        await follower.save();

        // Update followee's follower count
        followee.followersCount = (followee.followersCount || 0) + 1;
        await followee.save();

        // Sync with Neo4j
        await neo4jService.createFollowRelationship(followerId, followeeId);

        return res.status(200).json({ 
            message: 'Successfully followed user',
            following: follower.following,
            followingCount: follower.followingCount
        });

    } catch (error) {
        console.error('Failed to follow user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/unfollow/:userId - Unfollow a user
router.post('/unfollow/:userId', async (req, res) => {
    const session = req.auth;
    const followerId = session?.user?.id ?? session?.user?.sub;

    if (!session || !followerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { userId: followeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(followeeId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        // Update MongoDB
        const follower = await User.findById(followerId);
        const followee = await User.findById(followeeId);

        if (!follower || !followee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if actually following
        if (!follower.following || !follower.following.some(id => id.toString() === followeeId)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from following array
        follower.following = follower.following.filter(id => id.toString() !== followeeId);
        follower.followingCount = follower.following.length;
        await follower.save();

        // Update followee's follower count
        followee.followersCount = Math.max(0, (followee.followersCount || 0) - 1);
        await followee.save();

        // Sync with Neo4j
        await neo4jService.removeFollowRelationship(followerId, followeeId);

        return res.status(200).json({ 
            message: 'Successfully unfollowed user',
            following: follower.following,
            followingCount: follower.followingCount
        });

    } catch (error) {
        console.error('Failed to unfollow user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/block/:userIdToBlock - Block a user
router.post('/block/:userIdToBlock', async (req, res) => {
    const session = req.auth;
    const currentUserIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !currentUserIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const currentUserId = new mongoose.Types.ObjectId(currentUserIdString);
    const { userIdToBlock } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userIdToBlock)) {
        return res.status(400).json({ message: 'Invalid user ID to block' });
    }
    const userToBlockId = new mongoose.Types.ObjectId(userIdToBlock);

    if (currentUserId.equals(userToBlockId)) {
        return res.status(400).json({ message: 'Cannot block yourself' });
    }

    try {
        const currentUser = await User.findById(currentUserId);
        const userToBlock = await User.findById(userToBlockId);

        if (!currentUser || !userToBlock) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.blockedUserIds.some(id => id.equals(userToBlockId))) {
            currentUser.blockedUserIds.push(userToBlockId);
            await currentUser.save();
        }

        return res.status(200).json({ message: 'User blocked successfully', blockedUserIds: currentUser.blockedUserIds });

    } catch (error) {
        console.error('Failed to block user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/unblock/:userIdToUnblock - Unblock a user
router.post('/unblock/:userIdToUnblock', async (req, res) => {
    const session = req.auth;
    const currentUserIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !currentUserIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const currentUserId = new mongoose.Types.ObjectId(currentUserIdString);
    const { userIdToUnblock } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userIdToUnblock)) {
        return res.status(400).json({ message: 'Invalid user ID to unblock' });
    }
    const userToUnblockId = new mongoose.Types.ObjectId(userIdToUnblock);

    try {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' });
        }

        currentUser.blockedUserIds = currentUser.blockedUserIds.filter(id => !id.equals(userToUnblockId));
        await currentUser.save();

        return res.status(200).json({ message: 'User unblocked successfully', blockedUserIds: currentUser.blockedUserIds });

    } catch (error) {
        console.error('Failed to unblock user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
