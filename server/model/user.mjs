import mongoose from 'mongoose';
import neo4jService from '../services/neo4jService.mjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    isBot: {
        type: Boolean,
        default: false
    },
    password: { 
        type: String,
        required: function() {
            return this.authType !== 'oauth'; // Only required if not OAuth
        }
    },
    authType: {
        type: String,
        enum: ['credentials', 'oauth'],
        default: 'credentials'
    },
    provider: {
        type: String,
        required: function() {
            return this.authType === 'oauth'; // Only required for OAuth users
        }
    },
    profilePicture: {
        type: Buffer, // Changed from String to Buffer
    },
    bio: {
        type: String,
    },
    // Add the array to store conversation ObjectIds
    conversationIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }],
    // Optional denormalized counts
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    
    // Add following array to track who the user follows
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Add settings object
    settings: {
        receiveEmailNotifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
        // Add other settings as needed
    },

    // Add blockedUserIds array
    blockedUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Add verified field
    verified: {
        type: Boolean,
        default: false
    },
    // Communities user is a member of
    communities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    }],
    // Communities user has created/moderates (can be derived or explicit)
    moderatedCommunities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    }]
}, { timestamps: true });

// Middleware to sync user data to Neo4j after save
userSchema.post('save', async function(doc) {
    try {
        await neo4jService.syncUser(doc);
    } catch (error) {
        console.error('Error syncing user to Neo4j:', error);
    }
});

// Avoid recompiling the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;