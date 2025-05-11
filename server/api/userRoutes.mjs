import express from 'express';
import mongoose from 'mongoose';
import { hash, compare } from 'bcrypt';
import clientPromise from '../lib/mongodb.mjs';

const router = express.Router();

// Update the registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // Remove dateOfBirth from destructuring

  if (!name || !email || !password) { // Remove dateOfBirth from validation
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      // Remove dateOfBirth
      authType: 'credentials',
      createdAt: new Date(),
    });

    console.log('User registered with ID:', result.insertedId);
    return res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// OAuth user handling endpoint
router.post('/oauth-user', async (req, res) => {
  const { name, email, image, provider } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    console.log(`Processing OAuth user: ${email} from ${provider}`);

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log(`OAuth user exists: ${existingUser._id}`);
      
      // Update last login time
      await db.collection('users').updateOne(
        { _id: existingUser._id },
        { $set: { lastLogin: new Date() } }
      );
      
      return res.status(200).json({
        success: true,
        userId: existingUser._id,
        message: 'User authenticated'
      });
    }

    // Create new OAuth user
    const newUser = await db.collection('users').insertOne({
      name,
      email,
      profileImage: image,
      authType: 'oauth',
      provider,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    console.log(`New OAuth user created: ${newUser.insertedId}`);
    return res.status(201).json({
      success: true,
      userId: newUser.insertedId,
      message: 'OAuth user created'
    });
  } catch (error) {
    console.error('Error handling OAuth user:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error processing user' 
    });
  }
});

// Login endpoint for credential users
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

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
