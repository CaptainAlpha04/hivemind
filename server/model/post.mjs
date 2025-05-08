import mongoose from 'mongoose';

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
        required: true,
    },
    // Add image field back for BLOB storage
    image: {
        data: Buffer, // Store image data as Buffer (BLOB)
        contentType: String // Store MIME type
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema] // Embed comments using the sub-schema
}, { timestamps: true });

// Avoid recompiling the model
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
