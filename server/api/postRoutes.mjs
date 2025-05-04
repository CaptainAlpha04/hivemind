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
// Use upload.single('image') middleware to handle single file upload with field name 'image'
router.post('/', upload.single('image'), async (req, res) => {
    const session = req.auth;
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

    const { heading, content } = req.body;
    const imageFile = req.file; // Get file from req.file added by multer

    // Validate required fields
    if (!heading || !content) {
        return res.status(400).json({ message: 'Missing required fields: heading and content' });
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
            userId: userId,
            username: user.username, // Store username
            heading: heading,
            content: content,
            likes: [],
            comments: []
        };

        // Add image data if file exists
        if (imageFile) {
            postData.image = {
                data: imageFile.buffer,
                contentType: imageFile.mimetype
            };
        }

        // Create the new post document
        const newPost = new Post(postData);

        // Save the post to the database
        await newPost.save();

        // Prepare and return the response (don't send image buffer back)
        const postResponse = newPost.toObject();
        let hasImage = false;
        if (postResponse.image) {
            delete postResponse.image; // Remove image data from response
            hasImage = true;
        }
        postResponse.hasImage = hasImage; // Add flag indicating image presence

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
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

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
    const userIdString = session?.user?.id ?? session?.user?.sub;

    if (!session || !userIdString) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userId = new mongoose.Types.ObjectId(userIdString);

    const { postId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format' });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            userId: userId,
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Return the updated post or just the new comment
        // Returning the last comment added (which is the new one)
        const addedComment = post.comments[post.comments.length - 1];

        return res.status(201).json(addedComment);

    } catch (error) {
        console.error('Failed to add comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/posts - Fetch posts (example, implement pagination/filtering later)
router.get('/', async (req, res) => {
    try {
        // Basic fetch, sort by newest first. Add pagination later.
        const posts = await Post.find()
                                .sort({ createdAt: -1 })
                                .limit(20) // Example limit
                                .select('-image.data') // Exclude image buffer data from list view
                                .lean(); // Use lean for read-only operations

        // Add hasImage flag to each post in the list
        const postsWithImageFlag = posts.map(post => ({
            ...post,
            hasImage: !!(post.image && post.image.contentType) // Check if image field exists and has contentType
        }));

        return res.status(200).json(postsWithImageFlag);
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
