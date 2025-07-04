import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import bcrypt from 'bcrypt';
import User from '../model/user.mjs';
import neo4jService from '../services/neo4jService.mjs';
import { hash, compare } from 'bcrypt';
import {sendWelcomeEmail, sendVerificationCode, sendPasswordResetCode, sendEmailChangeVerification } from '../services/emailService.mjs';
import Token from '../model/token.mjs';
import sharp from 'sharp';

const router = express.Router();

// Configure multer for memory storage to handle profile pictures as BLOBs
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept only image files
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

// Helper function to process profile images - crop to square and resize
const processProfileImage = async (buffer) => {
  try {
    // Get image metadata to determine dimensions
    const metadata = await sharp(buffer).metadata();
    const size = Math.min(metadata.width, metadata.height); // Get the smaller dimension for square crop
    
    // Calculate crop region (centered)
    const left = Math.floor((metadata.width - size) / 2);
    const top = Math.floor((metadata.height - size) / 2);
    
    // Process the image: crop to square, resize to standard size, maintain quality
    return await sharp(buffer)
      .extract({ left, top, width: size, height: size }) // Crop to square
      .resize(256, 256) // Resize to standard size (you can adjust as needed)
      .jpeg({ quality: 85 }) // Convert to JPEG with good quality
      .toBuffer();
  } catch (error) {
    console.error('Error processing profile image:', error);
    // Return original buffer if processing fails
    return buffer;
  }
};

// POST /api/users - Create a new user
router.post('/', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, email, username, password, bio } = req.body;
        
        // Validate required fields
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: 'Missing required fields: name, email, username, and password are required' });
        }
        
        // Check if user with email or username already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'Email already in use' });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Username already taken' });
            }
        }
        
        // Hash the password - USE THIS STYLE CONSISTENTLY
        const hashedPassword = await hash(password, 12);
        
        // Create new user object
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            bio: bio || '',
            conversationIds: [],
            followersCount: 0,
            followingCount: 0,
            following: [],
            settings: {
                receiveEmailNotifications: true,
                theme: 'light'
            },
            blockedUserIds: []
        });
          // Add profile picture if uploaded
        if (req.file) {
            const processedImageBuffer = await processProfileImage(req.file.buffer);
            newUser.profilePicture = processedImageBuffer;
        }
        
        // Save the user to the database
        await newUser.save();
        
        // Create a sanitized user object to return (exclude password and other sensitive data)
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            bio: newUser.bio,
            hasProfilePicture: !!newUser.profilePicture,
            followersCount: newUser.followersCount,
            followingCount: newUser.followingCount,
            createdAt: newUser.createdAt
        };
        
        return res.status(201).json({ 
            message: 'User created successfully', 
            user: userResponse 
        });
        
    } catch (error) {
        console.error('Failed to create user:', error);
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

// GET /api/users/:userId - Get a user by ID
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        const user = await User.findById(userId).select('-password').lean(); // Exclude passwords
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format the user object to exclude sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            hasProfilePicture: !!user.profilePicture,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            following: user.following,
            settings: user.settings,
            blockedUserIds: user.blockedUserIds,
            bannerColor: user.bannerColor,
        };
        return res.status(200).json(userResponse);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password -profilePicture').lean(); // Exclude passwords
        return res.status(200).json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/users/:userId/profilePicture - Get a user's profile picture
router.get('/:userId/profilePicture', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const user = await User.findById(userId).select('profilePicture');
        
        if (!user || !user.profilePicture) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }
        
        // Set appropriate content type
        // Since we didn't store content type with the buffer, we'll use a default
        res.set('Content-Type', 'image/jpeg');
        res.send(user.profilePicture);
        
    } catch (error) {
        console.error('Failed to retrieve profile picture:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /api/users/:userId/profileUpdate - Update a user's profile
router.put('/:userId/profileUpdate', upload.single('profilePicture'), async (req, res) => { // Added upload.single middleware
  const { userId } = req.params;
  const { name, bio, bannerColor } = req.body; // Text fields from FormData

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields if provided
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (bannerColor) {
      user.bannerColor = bannerColor;
    }    // Update profile picture if a new file is uploaded
    if (req.file) {
      // Process the image to crop it to square format
      const processedImageBuffer = await processProfileImage(req.file.buffer);
      user.profilePicture = processedImageBuffer;
    }

    await user.save();

    // Respond with the updated user data (excluding sensitive information)
    const updatedUserResponse = {
      _id: user._id,
      name: user.name,
      email: user.email, // Keep email in response if needed by client
      username: user.username, // Keep username if needed
      bio: user.bio,
      bannerColor: user.bannerColor,
      hasProfilePicture: !!user.profilePicture, // Indicate if picture exists
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
    };

    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUserResponse });
  } catch (error) {
    console.error('Failed to update profile:', error);
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


// PUT /api/users/profilePicture - Update current user's profile picture
router.put('/profilePicture', upload.single('profilePicture'), async (req, res) => {
    const { userId: userIdString } = req.body; // Get userId from body

    if (!userIdString) { // Added: Check for userIdString
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    if (!mongoose.Types.ObjectId.isValid(userIdString)) { // Added: Validate userIdString
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);
    
    if (!req.file) {
        return res.status(400).json({ message: 'No profile picture provided' });
    }

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
          // Process and update user's profile picture
        const processedImageBuffer = await processProfileImage(req.file.buffer);
        user.profilePicture = processedImageBuffer;
        await user.save();
        
        return res.status(200).json({ message: 'Profile picture updated successfully' });
        
    } catch (error) {
        console.error('Failed to update profile picture:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Send verification code
router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate a 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save code in the database (using the Token model)
    // First delete any existing codes for this email
    await Token.deleteMany({ 
      email,
      type: 'verification-code'
    });
    
    // Create token document with email instead of userId
    const token = new Token({
      email, // Store email since we don't have userId yet
      token: verificationCode,
      type: 'verification-code',
      createdAt: new Date(),
      // expires in 10 minutes
    });
    
    await token.save();
    
    // Replace direct resend call with service function
    const emailSent = await sendVerificationCode(email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
    
    return res.status(200).json({ 
      message: 'Verification code sent to your email',
      success: true
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify the code
router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }
  
  try {
    const tokenDoc = await Token.findOne({ 
      email,
      token: code,
      type: 'verification-code'
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Check if code is expired (10 minutes)
    const now = new Date();
    const createdAt = new Date(tokenDoc.createdAt);
    const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
    if (diffMinutes > 10) {
      await Token.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Code is valid
    return res.status(200).json({ 
      message: 'Email verified successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, username, verificationCode } = req.body;

  try {
    // Verify the code one more time
    const tokenDoc = await Token.findOne({ 
      email,
      token: verificationCode,
      type: 'verification-code'
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid verification code. Please restart registration.' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create the user as already verified
    const hashedPassword = await hash(password, 12);
    
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      verified: true, // User is already verified
      createdAt: new Date()
    });

    const savedUser = await newUser.save();
    
    // Delete the verification token
    await Token.deleteOne({ _id: tokenDoc._id });

    // Replace direct resend call with service function
    const emailSent = await sendWelcomeEmail(email, name);
    
    if (!emailSent) {
      console.warn(`Failed to send welcome email to ${email}`);
      // Continue anyway since the user account is created
    }

    return res.status(201).json({ 
      message: 'Account created successfully!',
      userId: savedUser._id,
      success: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// OAuth user handling endpoint
router.post('/oauth-user', async (req, res) => {
  const { name, email, image, provider } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log(`OAuth user exists: ${user._id}`);
      
      // Update last login time
      await User.updateOne(
        { _id: user._id },
        { $set: { 
          lastLogin: new Date(),
          // Update provider information if this was previously a password user
          ...(user.authType !== 'oauth' ? { authType: 'oauth', provider } : {})
        }}
      );
      
      return res.status(200).json({
        success: true,
        userId: user._id.toString(), // Explicitly convert to string
        message: 'User authenticated'
      });
    }

    // Create new OAuth user
    const newUser = new User({
      name,
      email,
      username: email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate a username
      // No password for OAuth users
      password: null,
      profileImage: image,
      authType: 'oauth',
      provider,
      verified: true, // OAuth users are pre-verified
      createdAt: new Date(),
      lastLogin: new Date()
    });

    await newUser.save();
    
    console.log(`New OAuth user created: ${newUser._id}`);
    
    return res.status(201).json({
      success: true,
      userId: newUser._id.toString(), // Explicitly convert to string
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
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    // User not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is verified (if you require verification)
    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before signing in' });
    }
    
    // Check password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Password is correct, format the user object for NextAuth
    const userToReturn = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.profileImage || null
      // Add any other fields you need
    };
    
    // Return success with user data
    return res.status(200).json({ 
      success: true,
      user: userToReturn
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/settings - Update user settings
router.put('/settings', async (req, res) => {
    const { receiveEmailNotifications, theme, userId: userIdString } = req.body; // Get userId from body

    if (!userIdString) { // Added: Check for userIdString
        return res.status(400).json({ message: 'Missing userId in request body' });
    }
    if (!mongoose.Types.ObjectId.isValid(userIdString)) { // Added: Validate userIdString
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

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
    const { userId: followeeId } = req.params;
    const { followerId: followerIdString } = req.body; // Get followerId from body

    if (!followerIdString) { // Added: Check for followerIdString
        return res.status(400).json({ message: 'Missing followerId in request body' });
    }
    if (!mongoose.Types.ObjectId.isValid(followerIdString)) { // Added: Validate followerIdString
        return res.status(400).json({ message: 'Invalid followerId format' });
    }
    const followerId = followerIdString; // Use validated followerIdString


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
    const { userId: followeeId } = req.params;
    const { followerId: followerIdString } = req.body; // Get followerId from body

    if (!followerIdString) { // Added: Check for followerIdString
        return res.status(400).json({ message: 'Missing followerId in request body' });
    }
    if (!mongoose.Types.ObjectId.isValid(followerIdString)) { // Added: Validate followerIdString
        return res.status(400).json({ message: 'Invalid followerId format' });
    }
    const followerId = followerIdString; // Use validated followerIdString

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
    const currentUserId = new mongoose.Types.ObjectId(currentUserIdString.toString());
    const { userIdToBlock } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userIdToBlock)) {
        return res.status(400).json({ message: 'Invalid user ID to block' });
    }
    const userToBlockId = new mongoose.Types.ObjectId(userIdToBlock.toString());

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
    const userToUnblockId = new mongoose.Types.ObjectId(userIdToUnblock.toString());

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

// Send password reset code
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Check if user exists with this email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a reset code shortly.' 
      });
    }
    
    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing reset codes for this email
    await Token.deleteMany({ 
      userId: user._id,
      type: 'password-reset'
    });
    
    // Create token document
    const token = new Token({
      userId: user._id,
      token: resetCode,
      type: 'password-reset',
      createdAt: new Date()
    });
    
    await token.save();
    
    // Send reset code email
    const emailSent = await sendPasswordResetCode(email, resetCode);
    
    if (!emailSent) {
      console.warn(`Failed to send password reset email to ${email}`);
    }
    
    return res.status(200).json({ 
      message: 'If your email is registered, you will receive a reset code shortly.',
      success: true 
    });
    
  } catch (error) {
    console.error('Send password reset code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }
    
    const tokenDoc = await Token.findOne({ 
      userId: user._id,
      token: code,
      type: 'password-reset'
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    
    // Check if code is expired (10 minutes)
    const now = new Date();
    const createdAt = new Date(tokenDoc.createdAt);
    const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
    if (diffMinutes > 10) {
      await Token.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Code has expired' });
    }
    
    // Code is valid
    return res.status(200).json({ 
      message: 'Code verified successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Verify reset code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }
    
    const tokenDoc = await Token.findOne({ 
      userId: user._id,
      token: code,
      type: 'password-reset'
    });
    
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    
    // Check if code is expired (10 minutes)
    const now = new Date();
    const createdAt = new Date(tokenDoc.createdAt);
    const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
    if (diffMinutes > 10) {
      await Token.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Code has expired' });
    }
    
    // Update password
    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    // Delete the reset token
    await Token.deleteOne({ _id: tokenDoc._id });
    
    return res.status(200).json({ 
      message: 'Password updated successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:userId - Delete a user
router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    try {
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Optionally, delete the user's profile picture from storage if applicable
        
        return res.status(200).json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error('Failed to delete user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /api/users/:userId/email - Update a user email
router.put('/:userId/email', async (req, res) => {
    const { userId } = req.params;
    const { email, currentEmail } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
        }
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!currentEmail) {
            return res.status(400).json({ message: 'Current email is required' });
        }
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Check if the new email is already in use
            const existingUser = await User.findOne({ email: email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            if (user.email === email) {
                return res.status(400).json({ message: 'New email cannot be the same as current email' });
            }
            if (user.email !== currentEmail) {
                return res.status(400).json({ message: 'Current email does not match' });
            }
            user.email = email;
            await user.save();
            return res.status(200).json({ message: 'Email updated successfully', user });
        } catch (error) {
            console.error('Failed to update email:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });

// PUT /api/users/:userId - Update a user
router.put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, email, username, bio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (username) user.username = username;
        if (bio) user.bio = bio;

        await user.save();
        
        return res.status(200).json({ message: 'User updated successfully', user });
        
    } catch (error) {
        console.error('Failed to update user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /api/users/:userId/profilePicture - Update a user's profile picture
router.put('/:userId/profilePicture', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
          // Update user's profile picture
        if (req.file) {
            const processedImageBuffer = await processProfileImage(req.file.buffer);
            user.profilePicture = processedImageBuffer;
        }
        
        await user.save();
        
        return res.status(200).json({ message: 'Profile picture updated successfully' });
        
    } catch (error) {
        console.error('Failed to update profile picture:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /api/users/:userId/password - Update a user's password
router.put('/:userId/password', async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All password fields are required' });
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Validate minimum password length
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify the current password is correct
        const isCurrentPasswordValid = await compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update user's password with new hashed password
        const hashedNewPassword = await hash(newPassword, 12);
        user.password = hashedNewPassword;
        
        await user.save();
        
        return res.status(200).json({ message: 'Password updated successfully' });
        
    } catch (error) {
        console.error('Failed to update password:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/:userId/request-email-change
router.post('/:userId/request-email-change', async (req, res) => {
    const { userId } = req.params;
    const { currentEmail, newEmail, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        // Validate the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current email matches
        if (user.email !== currentEmail) {
            return res.status(400).json({ message: 'Current email does not match' });
        }

        // Check if new email is already in use
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use by another account' });
        }

        // Only verify password if it was provided
        if (password) {
            const isPasswordValid = await compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        }
        // If no password provided, assume validation happened in a previous step

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store verification code in database
        await Token.deleteMany({ 
            userId: user._id,
            type: 'email-change'
        });
        
        const token = new Token({
            userId: user._id,
            token: verificationCode,
            type: 'email-change',
            metadata: { newEmail }, // Store the new email in metadata
            createdAt: new Date()
        });
        
        await token.save();
        
        // Send verification code to the NEW email address
        const emailSent = await sendEmailChangeVerification(newEmail, verificationCode);
        
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send verification email' });
        }
        
        return res.status(200).json({ 
            message: 'Verification code sent to your new email',
            success: true
        });
    } catch (error) {
        console.error('Error requesting email change:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/users/:userId/verify-email-change
router.post('/:userId/verify-email-change', async (req, res) => {
    const { userId } = req.params;
    const { newEmail, verificationCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        // Find the verification token
        const tokenDoc = await Token.findOne({ 
            userId,
            token: verificationCode,
            type: 'email-change'
        });
        
        if (!tokenDoc) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }
        
        // Verify the new email matches what was requested
        if (tokenDoc.metadata?.newEmail !== newEmail) {
            return res.status(400).json({ message: 'Email mismatch. Please restart the email change process.' });
        }
        
        // Check if code is expired (10 minutes)
        const now = new Date();
        const createdAt = new Date(tokenDoc.createdAt);
        const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
        
        if (diffMinutes > 10) {
            await Token.deleteOne({ _id: tokenDoc._id });
            return res.status(400).json({ message: 'Verification code has expired' });
        }
        
        // Update user's email
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.email = newEmail;
        await user.save();
        
        // Delete the token
        await Token.deleteOne({ _id: tokenDoc._id });
        
        return res.status(200).json({ 
            message: 'Email updated successfully',
            success: true
        });
    } catch (error) {
        console.error('Error verifying email change:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/users/validate-email-change
router.post('/validate-email-change', async (req, res) => {
  const { userId, currentEmail, newEmail, password } = req.body;

  if (!userId || !currentEmail || !newEmail || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current email matches
    if (user.email !== currentEmail) {
      return res.status(400).json({ message: 'Current email does not match' });
    }

    // Check if new email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered with another account' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // If all validations pass
    return res.status(200).json({ 
      message: 'Validation successful',
      success: true
    });
  } catch (error) {
    console.error('Error validating email change:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
