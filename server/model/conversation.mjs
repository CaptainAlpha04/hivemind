import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // Embed last message details
    lastMessage: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderUsername: { type: String }, // Denormalized username for efficiency
        content: { type: String }, // Store actual content or "Media" indicator
        mediaUrl: { type: String }, // Store mediaUrl if present
        createdAt: { type: Date } // Timestamp of the last message
    },
    // Remove lastMessageAt if lastMessage.createdAt replaces its purpose for sorting
    // lastMessageAt: {
    //     type: Date,
    //     index: true
    // },
}, { timestamps: true }); // updatedAt will now reflect the last message time

// Index the embedded senderId if needed for specific queries
// conversationSchema.index({ "lastMessage.senderId": 1 });
// Index the updatedAt field for sorting conversations by recent activity
conversationSchema.index({ updatedAt: -1 });


// Avoid recompiling the model
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;