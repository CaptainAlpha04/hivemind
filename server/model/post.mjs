import mongoose from 'mongoose';
import neo4jService from '../services/neo4jService.mjs';

// Create a comment schema that can support nested replies
const commentSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: { // Denormalize username for easier display
        type: String,
        required: true
    }, 
    text: {
        type: String,
        required: true
    },
    // Add likes array to comments
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Add fields for comment threading
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    // This will be a placeholder for the replies array
    // We'll add it after schema definition due to its self-referential nature
    replies: {
        type: Array,
        default: []
    }
});

// Add the nested replies schema after initial definition
// This allows for proper references to the same schema
commentSchema.add({
    replies: [commentSchema]
});

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: { // Denormalize username for easier display
        type: String,
        required: true
    },
    heading: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    // Change image field to store an array of images
    images: [{ // Changed from 'image' to 'images' and made it an array
        data: Buffer, // Store image data as Buffer (BLOB)
        contentType: String // Store MIME type
    }],
    // Add visibility field
    visibility: {
        type: String,
        enum: ['public', 'followers_only', 'private', 'community_only'], // Added 'community_only'
        default: 'public',
        required: true
    },
    community: { // Add community field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        index: true, // Index for faster queries on community posts
        required: function() { // Required only if visibility is 'community_only'
            return this.visibility === 'community_only';
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema] // Embed comments using the updated sub-schema with reply support
}, { timestamps: true });

// Helper method to find a comment by ID (including nested replies)
postSchema.methods.findCommentById = function(commentId) {
    // Function to recursively search for a comment
    function findComment(comments, id) {
        for (const comment of comments) {
            if (comment._id.toString() === id.toString()) {
                return comment;
            }
            
            // If this comment has replies, search them too
            if (comment.replies && comment.replies.length > 0) {
                const found = findComment(comment.replies, id);
                if (found) return found;
            }
        }
        return null;
    }
    
    return findComment(this.comments, commentId);
};

// Middleware to sync post data to Neo4j after save
postSchema.post('save', async function(doc) {
    try {
        await neo4jService.syncPost(doc);
    } catch (error) {
        console.error('Error syncing post to Neo4j:', error);
    }
});

// Middleware for handling likes - sync to Neo4j when likes are updated
postSchema.pre('findOneAndUpdate', async function() {
    this._update = this._update || {};
    
    // Store the original document for comparison
    if (this._update.$push && this._update.$push.likes) {
        // Someone is liking a post
        const userId = this._update.$push.likes.toString();
        const postId = this._conditions._id.toString();
        
        try {
            await neo4jService.createLikeRelationship(userId, postId);
        } catch (error) {
            console.error('Error syncing like relationship to Neo4j:', error);
        }
    }
    
    if (this._update.$pull && this._update.$pull.likes) {
        // Someone is unliking a post
        const userId = this._update.$pull.likes.toString();
        const postId = this._conditions._id.toString();
        
        try {
            await neo4jService.removeLikeRelationship(userId, postId);
        } catch (error) {
            console.error('Error removing like relationship from Neo4j:', error);
        }
    }
});

// Avoid recompiling the model
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;