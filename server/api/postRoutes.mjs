import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer'; // Import multer
import Post from '../model/post.mjs';
import User from '../model/user.mjs'; // Needed to get username

const router = express.Router();

// Configure multer for memory storage and image file filter
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

// POST /api/posts - Create a new post
// Use upload.array('images') middleware to handle multiple file uploads with field name 'images'
router.post('/', upload.array('images', 5), async (req, res) => { // userId will be passed in req.body instead of relying on auth session
    // const session = req.auth; // Removed: No longer relying on session populated by auth middleware for userId
    // const userIdFromAuth = session?.user?.id; // Removed: userId will come from req.body

    const { heading, content, visibility, userId } = req.body; // Destructure userId directly from req.body
    const imageFiles = req.files; // Get files from req.files added by multer

    // Validate userId from request body
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { // Ensure mongoose is in scope
        console.error('Invalid or missing user ID in request body:', userId);
        return res.status(400).json({ message: 'Invalid user ID format or missing user ID in request body' });
    }

    // Validate required fields
    if (!heading || !content) {
        return res.status(400).json({ message: 'Missing required fields: heading and content' });
    }    // Optional: Validate visibility if provided, or rely on schema default
    // Map frontend visibility values to backend values
    let visibilityValue = 'public'; // Default
    
    if (visibility) {
        if (visibility === 'private') {
            visibilityValue = 'private';
        } else if (visibility === 'Communities') {
            visibilityValue = 'followers_only'; // Map 'Communities' from frontend to 'followers_only' on backend
        } else if (visibility === 'public') {
            visibilityValue = 'public';
        } else if (!['public', 'followers_only', 'private'].includes(visibility)) {
            return res.status(400).json({ message: 'Invalid visibility value.' });
        } else {
            visibilityValue = visibility; // If it's already a valid value
        }
    }

    try {
        // Get sender's username for denormalization
        const user = await User.findById(userId).select('username').lean();
        if (!user) {
            // This should technically not happen if authentication passed
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prepare post data
        const postData = {
            userId: userId,            username: user.username, // Store username
            heading: heading,
            content: content,
            likes: [],
            comments: [],
            visibility: visibilityValue, // Use our mapped visibility value
            images: [] // Initialize as an empty array
        };

        // Add image data if files exist
        if (imageFiles && imageFiles.length > 0) {
            postData.images = imageFiles.map(file => ({ // Map over imageFiles
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        // Create the new post document
        const newPost = new Post(postData);

        // Save the post to the database
        await newPost.save();

        // Prepare and return the response (don't send image buffers back)
        const postResponse = newPost.toObject();
        let hasImages = false; // Changed from hasImage
        if (postResponse.images && postResponse.images.length > 0) { // Check images array
            hasImages = true;
            // Remove image data from response for brevity and security
            postResponse.images = postResponse.images.map(img => ({ contentType: img.contentType, _id: img._id }));
        }
        postResponse.hasImages = hasImages; // Changed from hasImage

        return res.status(201).json(postResponse);

    } catch (error) {
        console.error('Failed to create post:', error);
        // Handle specific errors (Validation, Multer)
        if (error instanceof multer.MulterError) {
             return res.status(400).json({ message: `Multer error: ${error.message}` });
        } else if (error.message === 'Not an image! Please upload only images.') {
            return res.status(400).json({ message: error.message });
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/posts/:postId/like - Like/Unlike a post
router.post('/:postId/like', async (req, res) => {
    const session = req.auth;
    const userId = session?.user?.id;
    
    // Our middleware already enforces authentication, but double check
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already liked the post
        const likeIndex = post.likes.findIndex(likeId => likeId.equals(userId));

        if (likeIndex > -1) {
            // User already liked, so unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked, so like
            post.likes.push(userId);
        }

        await post.save();

        // Return updated like count or the updated post (without image data)
        const postResponse = post.toObject();
        delete postResponse.image;
        if (post.image && post.image.data) {
             postResponse.hasImage = true;
        }

        return res.status(200).json(postResponse);

    } catch (error) {
        console.error('Failed to like/unlike post:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/posts/:postId/comment - Add a comment to a post
router.post('/:postId/comment', async (req, res) => {
    const session = req.auth;
    const userId = session?.user?.id;
    
    // Our middleware already enforces authentication
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { postId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format' });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    try {
        // Fetch user to get username for denormalization
        const user = await User.findById(userId).select('username').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            userId: userId,
            username: user.username, // Add username
            text: text.trim(),
            likes: [], // Initialize likes array
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Return the newly added comment (which is the last one in the array)
        const addedComment = post.comments[post.comments.length - 1];

        return res.status(201).json(addedComment);

    } catch (error) {
        console.error('Failed to add comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/posts/:postId/comments/:commentId/like - Like/Unlike a comment
router.post('/:postId/comments/:commentId/like', async (req, res) => {
    const session = req.auth;
    const userId = session?.user?.id;
    
    // Our auth middleware already verified authentication
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { postId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: 'Invalid post or comment ID format' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the specific comment within the post's comments array
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user already liked the comment
        const likeIndex = comment.likes.findIndex(likeId => likeId.equals(userId));

        if (likeIndex > -1) {
            // User already liked, so unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked, so like
            comment.likes.push(userId);
        }

        await post.save();

        // Return the updated comment
        return res.status(200).json(comment);

    } catch (error) {
        console.error('Failed to like/unlike comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/posts - Fetch posts (example, implement pagination/filtering later)
router.get('/', async (req, res) => {
    const session = req.auth;
    let currentUserId = null;
    
    // If authenticated, middleware has already validated and converted the ID
    if (session?.user?.id) {
        currentUserId = session.user.id;
    }

    try {
        // Base query
        let query = {};

        // If a user is logged in, we need to fetch their details for 'followers_only' posts
        let currentUser = null;
        if (currentUserId) {
            currentUser = await User.findById(currentUserId).select('followingCount blockedUserIds').lean();
        }

        // Construct the query to filter posts based on visibility
        // This is a simplified version. For true 'followers_only', you'd need to check if post.userId is in currentUser.following
        // and for 'private', only the post owner should see it.
        // For now, public posts are always visible. Others might be restricted based on auth.
        
        const posts = await Post.find(query) // Query will be refined below
                                .sort({ createdAt: -1 })
                                .limit(20) 
                                .select('-image.data') 
                                .lean(); 

        const filteredPosts = posts.filter(post => {
            if (post.visibility === 'public') {
                return true;
            }
            if (!currentUserId) { // Unauthenticated users only see public posts
                return false;
            }
            // Filter out posts from users blocked by the current user
            if (currentUser && currentUser.blockedUserIds && currentUser.blockedUserIds.some(blockedId => blockedId.equals(post.userId))){
                return false;
            }
            // Filter out posts from users who have blocked the current user (requires adding blockedBy to User schema or a separate Block schema)
            // For simplicity, this part is omitted here but important for a full implementation.

            if (post.visibility === 'private') {
                return post.userId.equals(currentUserId);
            }
            if (post.visibility === 'followers_only') {
                // This requires knowing if the post.userId is followed by currentUserId.
                // This check is complex with the current structure and might require a $lookup or client-side filtering after fetching user's following list.
                // For now, let's assume if the user is logged in, they can see followers_only posts (placeholder logic)
                // In a real app, you would fetch the current user's following list and check against post.userId
                return true; // Placeholder: Needs proper implementation
            }
            return false; // Should not reach here if visibility enum is enforced
        }).map(post => ({
            ...post,
            hasImage: !!(post.image && post.image.contentType)
        }));

        return res.status(200).json(filteredPosts);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/posts/:postId/image - Endpoint to retrieve a post image
router.get('/:postId/image', async (req, res) => {
    try {
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID format' });
        }

        const post = await Post.findById(postId).select('image');

        if (!post || !post.image || !post.image.data) {
            return res.status(404).json({ message: 'Image not found for this post' });
        }

        // Set the content type header and send the image buffer
        res.set('Content-Type', post.image.contentType);
        res.send(post.image.data);

    } catch (error) {
        console.error('Failed to retrieve post image:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
