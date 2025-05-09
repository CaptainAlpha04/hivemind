import express from 'express';
import mongoose from 'mongoose';
import neo4jService from '../services/neo4jService.mjs';
import User from '../model/user.mjs';
import Post from '../model/post.mjs';

const router = express.Router();

/**
 * GET /api/recommendations/posts
 * Get personalized post recommendations for current user
 */
router.get('/posts', async (req, res) => {
  const session = req.auth;
  const userIdString = session?.user?.id ?? session?.user?.sub;

  if (!session || !userIdString) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const userId = userIdString;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recommendations from Neo4j
    const recommendations = await neo4jService.getRecommendedPosts(userId, limit);
    
    // Enrich with MongoDB data if needed
    const enrichedRecommendations = await Promise.all(recommendations.map(async (recommendation) => {
      // You could fetch additional data from MongoDB here if needed
      return {
        ...recommendation,
        score: recommendation.recommendationScore,
        // Add any additional fields you want to include
      };
    }));
    
    return res.status(200).json(enrichedRecommendations);
  } catch (error) {
    console.error('Failed to get post recommendations:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /api/recommendations/friends
 * Get friend recommendations for current user
 */
router.get('/friends', async (req, res) => {
  const session = req.auth;
  const userIdString = session?.user?.id ?? session?.user?.sub;

  if (!session || !userIdString) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const userId = userIdString;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recommendations from Neo4j
    const recommendations = await neo4jService.getRecommendedFriends(userId, limit);
    
    // Enrich with MongoDB data if needed
    const enrichedRecommendations = await Promise.all(recommendations.map(async (recommendation) => {
      try {
        // Fetch additional user details from MongoDB
        const userData = await User.findById(recommendation.userId, 'profilePicture bio');
        
        return {
          ...recommendation,
          score: recommendation.recommendationScore,
          profilePicture: userData?.profilePicture,
          bio: userData?.bio,
        };
      } catch (err) {
        // If there's an error fetching additional data, just return the recommendation
        return recommendation;
      }
    }));
    
    return res.status(200).json(enrichedRecommendations);
  } catch (error) {
    console.error('Failed to get friend recommendations:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /api/recommendations/sync
 * Admin route to trigger a full resync of MongoDB data to Neo4j
 * In production, this should be protected or replaced with a scheduled job
 */
router.get('/sync', async (req, res) => {
  try {
    // Initialize Neo4j indexes
    await neo4jService.initializeIndexes();
    
    // Sync all users
    const users = await User.find({});
    for (const user of users) {
      await neo4jService.syncUser(user);
    }
    
    // Sync all posts
    const posts = await Post.find({});
    for (const post of posts) {
      await neo4jService.syncPost(post);
    }
    
    // Sync follows and likes relationships
    // This is a simplified example - in production, you would need a more efficient approach
    for (const user of users) {
      // You would need fields in your MongoDB schema to track follows and likes
      // This is just an example of how you might sync relationships
      
      // Example: Sync follows (assuming you have a 'following' array in your User model)
      if (user.following) {
        for (const followeeId of user.following) {
          await neo4jService.createFollowRelationship(user._id.toString(), followeeId.toString());
        }
      }
    }
    
    // Sync likes from posts
    for (const post of posts) {
      if (post.likes && post.likes.length > 0) {
        for (const userId of post.likes) {
          await neo4jService.createLikeRelationship(userId.toString(), post._id.toString());
        }
      }
    }
    
    return res.status(200).json({ message: 'Database sync completed successfully' });
  } catch (error) {
    console.error('Failed to sync databases:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;