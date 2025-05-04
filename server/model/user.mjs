import mongoose from 'mongoose';

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
    password: { // Store hashed passwords only!
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
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
    followingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Avoid recompiling the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;