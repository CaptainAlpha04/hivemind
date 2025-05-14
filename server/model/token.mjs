import mongoose from 'mongoose';
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.email; // Only required if email is not present
    }
  },
  email: {
    type: String,
    required: function() {
      return !this.userId; // Only required if userId is not present
    }
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['verification', 'verification-code', 'password-reset'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

// Generate random token
tokenSchema.statics.generateToken = async function(userId, type) {
  // Delete any existing tokens first
  await this.deleteMany({ userId, type });
  
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Create a new token document
  const tokenDoc = new this({
    userId,
    token,
    type
  });
  
  // Save to database
  await tokenDoc.save();
  return token;
};

const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);
export default Token;