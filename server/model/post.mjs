import mongoose from 'mongoose';
import neo4jService from '../services/neo4jService.mjs';

const commentSchema = new mongoose.Schema({
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
    }
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
    comments: [commentSchema] // Embed comments using the sub-schema
}, { timestamps: true });

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
