import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['verification-code', 'password-reset', 'email-change'], // Add 'email-change' here
    required: true,
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes in seconds
  },
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;