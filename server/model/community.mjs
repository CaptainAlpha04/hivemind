import mongoose from 'mongoose';
import neo4jService from '../services/neo4jService.mjs'; // Import Neo4jService

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  rules: [{
    title: String,
    description: String,
  }],
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  bannerImage: {
    data: Buffer,
    contentType: String,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  // Add any other relevant fields like tags, category, etc.
}, { timestamps: true });

// Add an index on the name for faster searching
communitySchema.index({ name: 'text', description: 'text' });

// Ensure creator is automatically added to members and moderators
communitySchema.pre('save', async function(next) {
  if (this.isNew) {
    if (!this.members.includes(this.creator)) {
      this.members.push(this.creator);
    }
    if (!this.moderators.includes(this.creator)) {
      this.moderators.push(this.creator);
    }
  }
  next();
});

// Middleware to sync community data to Neo4j after save
communitySchema.post('save', async function(doc) {
  try {
    await neo4jService.syncCommunity(doc);
    // If it's a new community, also sync creator as member and moderator
    if (this.isNew) {
      await neo4jService.createMembershipRelationship(doc.creator.toString(), doc._id.toString());
      await neo4jService.createModeratorRelationship(doc.creator.toString(), doc._id.toString());
    }
  } catch (error) {
    console.error('Error syncing community to Neo4j:', error);
  }
});

// Middleware for handling member changes - sync to Neo4j
communitySchema.pre('findOneAndUpdate', async function() {
  this._update = this._update || {};
  const originalDoc = await this.model.findOne(this.getQuery());
  this._originalMembers = originalDoc ? [...originalDoc.members] : [];
  this._originalModerators = originalDoc ? [...originalDoc.moderators] : [];
});

communitySchema.post('findOneAndUpdate', async function(doc) {
  if (!doc) return; // If document was not found and updated

  const newMembers = doc.members.map(id => id.toString());
  const oldMembers = this._originalMembers.map(id => id.toString());

  const newModerators = doc.moderators.map(id => id.toString());
  const oldModerators = this._originalModerators.map(id => id.toString());

  // Sync new members
  for (const userId of newMembers) {
    if (!oldMembers.includes(userId)) {
      try {
        await neo4jService.createMembershipRelationship(userId, doc._id.toString());
      } catch (error) {
        console.error('Error syncing new member to Neo4j:', error);
      }
    }
  }
  // Sync removed members
  for (const userId of oldMembers) {
    if (!newMembers.includes(userId)) {
      try {
        await neo4jService.removeMembershipRelationship(userId, doc._id.toString());
      } catch (error) {
        console.error('Error syncing removed member from Neo4j:', error);
      }
    }
  }

  // Sync new moderators
  for (const userId of newModerators) {
    if (!oldModerators.includes(userId)) {
      try {
        await neo4jService.createModeratorRelationship(userId, doc._id.toString());
      } catch (error) {
        console.error('Error syncing new moderator to Neo4j:', error);
      }
    }
  }
  // Sync removed moderators
  for (const userId of oldModerators) {
    if (!newModerators.includes(userId)) {
      try {
        await neo4jService.removeModeratorRelationship(userId, doc._id.toString());
      } catch (error) {
        console.error('Error syncing removed moderator from Neo4j:', error);
      }
    }
  }

  // Sync posts added to community
  if (this._update.$addToSet && this._update.$addToSet.posts) {
    const postId = this._update.$addToSet.posts.toString();
    try {
        await neo4jService.addPostToCommunity(postId, doc._id.toString());
    } catch (error) {
        console.error('Error syncing post addition to community in Neo4j:', error);
    }
  }

  // Sync posts removed from community
  if (this._update.$pull && this._update.$pull.posts) {
      const postId = this._update.$pull.posts.toString();
      try {
          await neo4jService.removePostFromCommunity(postId, doc._id.toString());
      } catch (error) {
          console.error('Error syncing post removal from community in Neo4j:', error);
      }
  }
});

const Community = mongoose.model('Community', communitySchema);

export default Community;
