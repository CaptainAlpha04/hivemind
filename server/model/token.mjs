import mongoose from 'mongoose';
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['verification', 'password-reset'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

// Generate random token
tokenSchema.statics.generateVerificationToken = async function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  
  const tokenDoc = new this({
    userId,
    token,
    type: 'verification'
  });
  
  await tokenDoc.save();
  return token;
};

const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);
export default Token;