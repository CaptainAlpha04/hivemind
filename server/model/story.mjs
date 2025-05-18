import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: {
        // Denormalized username for easier display
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100 // Limiting title length
    },
    image: {
        data: {
            type: Buffer,
            required: true // Making the image mandatory
        },
        contentType: {
            type: String,
            required: true
        }
    },
    // Optional caption/description
    caption: {
        type: String,
        trim: true,
        maxlength: 250
    },
    // Viewers track who has seen the story
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Stories typically expire after 24 hours
    expiresAt: {
        type: Date,
        default: function() {
            const now = new Date();
            return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from creation
        },
        index: { expires: 0 } // TTL index for automatic deletion after expiry
    }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Create indexes for efficient queries
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

// Avoid recompiling the model
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

export default Story;
