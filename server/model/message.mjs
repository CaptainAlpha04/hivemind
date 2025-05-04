import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a 'User' model
        required: true
    },
    content: { // Text content of the message
        type: String,
        // Not strictly required if image exists
    },
    // Replace mediaUrl with image field for BLOB storage
    image: {
        data: Buffer, // Store image data as Buffer (BLOB)
        contentType: String // Store MIME type (e.g., 'image/jpeg', 'image/png')
    },
    readBy: [{ // Optional: Track who read the message
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true }); // Adds createdAt and updatedAt

// Avoid recompiling the model
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;