import { driver } from '../config/neo4jConfig.mjs';

/**
 * Neo4j Graph Database Service for Social Recommendations
 * Handles the creation, updating, and querying of the graph data for recommendations
 */
class Neo4jService {
  
  /**
   * Create or update user node in Neo4j
   * @param {Object} user - User object from MongoDB
   */
  async syncUser(user) {
    const session = driver.session();
    try {
      await session.executeWrite(tx => 
        tx.run(
          `MERGE (u:User {id: $userId})
           ON CREATE SET u.name = $name, u.username = $username, u.email = $email, u.createdAt = $createdAt
           ON MATCH SET u.name = $name, u.username = $username, u.email = $email`,
          { 
            userId: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
          }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Create or update post node in Neo4j
   * @param {Object} post - Post object from MongoDB
   */
  async syncPost(post) {
    const session = driver.session();
    try {
      // Create or update post node
      await session.executeWrite(tx =>
        tx.run(
          `MERGE (p:Post {id: $postId})
           ON CREATE SET p.heading = $heading, p.content = $content, p.createdAt = $createdAt,
                         p.userId = $userId, p.username = $username, p.visibility = $visibility
           ON MATCH SET p.heading = $heading, p.content = $content, p.visibility = $visibility`,
          {
            postId: post._id.toString(),
            heading: post.heading,
            content: post.content,
            userId: post.userId.toString(),
            username: post.username,
            createdAt: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
            visibility: post.visibility
          }
        )
      );

      // Connect post to user (POSTED relationship)
      await session.executeWrite(tx =>
        tx.run(
          `MATCH (u:User {id: $userId}), (p:Post {id: $postId})
           MERGE (u)-[:POSTED]->(p)`,
          {
            userId: post.userId.toString(),
            postId: post._id.toString()
          }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Create a FOLLOWS relationship between users
   * @param {string} followerId - ID of the follower user
   * @param {string} followeeId - ID of the user being followed
   */
  async createFollowRelationship(followerId, followeeId) {
    const session = driver.session();
    try {
      await session.executeWrite(tx =>
        tx.run(
          `MATCH (follower:User {id: $followerId})
           MATCH (followee:User {id: $followeeId})
           MERGE (follower)-[:FOLLOWS]->(followee)`,
          { followerId, followeeId }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Remove a FOLLOWS relationship between users
   * @param {string} followerId - ID of the follower user
   * @param {string} followeeId - ID of the user being followed
   */
  async removeFollowRelationship(followerId, followeeId) {
    const session = driver.session();
    try {
      await session.executeWrite(tx =>
        tx.run(
          `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(followee:User {id: $followeeId})
           DELETE r`,
          { followerId, followeeId }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Create a LIKES relationship between a user and a post
   * @param {string} userId - ID of the user
   * @param {string} postId - ID of the post
   */
  async createLikeRelationship(userId, postId) {
    const session = driver.session();
    try {
      await session.executeWrite(tx =>
        tx.run(
          `MATCH (u:User {id: $userId})
           MATCH (p:Post {id: $postId})
           MERGE (u)-[:LIKES]->(p)`,
          { userId, postId }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Remove a LIKES relationship between a user and a post
   * @param {string} userId - ID of the user
   * @param {string} postId - ID of the post
   */
  async removeLikeRelationship(userId, postId) {
    const session = driver.session();
    try {
      await session.executeWrite(tx =>
        tx.run(
          `MATCH (u:User {id: $userId})-[r:LIKES]->(p:Post {id: $postId})
           DELETE r`,
          { userId, postId }
        )
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Get recommended posts for a user using collaborative filtering
   * @param {string} userId - ID of the user
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Array} Array of post recommendations
   */
  async getRecommendedPosts(userId, limit = 10) {
    const session = driver.session();
    try {
      // Advanced collaborative filtering recommendation query
      const result = await session.executeRead(tx =>
        tx.run(
          `MATCH (targetUser:User {id: $userId})
           
           // Find posts liked by users who the target user follows
           OPTIONAL MATCH (targetUser)-[:FOLLOWS]->(followedUser)-[:LIKES]->(post:Post)
           WHERE NOT (targetUser)-[:LIKES]->(post) 
             AND post.visibility = 'public'
           WITH post, count(*) as followedUserScore
           
           // Find posts liked by users with similar taste (who like the same posts)
           OPTIONAL MATCH (targetUser)-[:LIKES]->(commonPost)<-[:LIKES]-(similarUser)
           WHERE similarUser.id <> $userId
           WITH post, followedUserScore, similarUser
           OPTIONAL MATCH (similarUser)-[:LIKES]->(recommendedPost:Post)
           WHERE NOT (targetUser)-[:LIKES]->(recommendedPost)
             AND recommendedPost.visibility = 'public' 
             AND recommendedPost.id IS NOT NULL
           
           WITH recommendedPost, 
                count(DISTINCT similarUser) as similarityScore,
                collect(DISTINCT followedUserScore)[0] as followedScore
           
           WITH recommendedPost,
                CASE WHEN similarityScore IS NULL THEN 0 ELSE similarityScore END as similarityScore,
                CASE WHEN followedScore IS NULL THEN 0 ELSE followedScore END as followedScore
           
           WITH recommendedPost,
                (similarityScore * 2) + (followedScore * 3) as recommendationScore
                
           // Order by recommendation score and return limited results
           WHERE recommendationScore > 0
           RETURN recommendedPost.id as postId, recommendedPost.heading as heading, 
                  recommendedPost.content as content, recommendedPost.username as username,
                  recommendedPost.userId as userId,
                  recommendationScore
           ORDER BY recommendationScore DESC
           LIMIT $limit`,
          { userId, limit: parseInt(limit) }
        )
      );
      
      return result.records.map(record => ({
        postId: record.get('postId'),
        heading: record.get('heading'),
        content: record.get('content'),
        username: record.get('username'),
        userId: record.get('userId'),
        recommendationScore: record.get('recommendationScore').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Get recommended friends for a user
   * @param {string} userId - ID of the user
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Array} Array of user recommendations
   */
  async getRecommendedFriends(userId, limit = 10) {
    const session = driver.session();
    try {
      const result = await session.executeRead(tx =>
        tx.run(
          `MATCH (targetUser:User {id: $userId})
           
           // Friends of friends who the user doesn't follow yet
           OPTIONAL MATCH (targetUser)-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof:User)
           WHERE NOT (targetUser)-[:FOLLOWS]->(fof)
             AND targetUser.id <> fof.id
           WITH fof, count(friend) as fofScore
           
           // Users who like similar posts
           OPTIONAL MATCH (targetUser)-[:LIKES]->(post)<-[:LIKES]-(similarTasteUser:User)
           WHERE NOT (targetUser)-[:FOLLOWS]->(similarTasteUser)
             AND targetUser.id <> similarTasteUser.id
           WITH fof, fofScore, similarTasteUser, count(post) as commonInterestsScore
           
           // Combined recommendations
           WITH 
             CASE WHEN fof IS NOT NULL THEN collect({
               userId: fof.id,
               username: fof.username,
               name: fof.name,
               score: fofScore * 2  // Weight for friends-of-friends
             }) ELSE [] END +
             CASE WHEN similarTasteUser IS NOT NULL THEN collect({
               userId: similarTasteUser.id,
               username: similarTasteUser.username,
               name: similarTasteUser.name,
               score: commonInterestsScore  // Weight for similar interests
             }) ELSE [] END as recommendations
           
           // Unwrap the collections
           UNWIND recommendations as recommendation
           
           // Group by user to combine scores from different recommendation sources
           WITH recommendation.userId as userId, 
                recommendation.username as username,
                recommendation.name as name,
                sum(recommendation.score) as totalScore
           
           // Return top recommendations
           WHERE totalScore > 0
           RETURN userId, username, name, totalScore as recommendationScore
           ORDER BY recommendationScore DESC
           LIMIT $limit`,
          { userId, limit: parseInt(limit) }
        )
      );
      
      return result.records.map(record => ({
        userId: record.get('userId'),
        username: record.get('username'),
        name: record.get('name'),
        recommendationScore: record.get('recommendationScore').toNumber()
      }));
    } finally {
      await session.close();
    }
  }
  
  /**
   * Initialize database indexes for better query performance
   */
  async initializeIndexes() {
    const session = driver.session();
    try {
      await session.executeWrite(tx => 
        tx.run('CREATE INDEX user_id IF NOT EXISTS FOR (u:User) ON (u.id)')
      );
      await session.executeWrite(tx => 
        tx.run('CREATE INDEX post_id IF NOT EXISTS FOR (p:Post) ON (p.id)')
      );
      console.log('Neo4j indexes created successfully');
    } catch (error) {
      console.error('Error creating Neo4j indexes:', error);
    } finally {
      await session.close();
    }
  }
}

export default new Neo4jService();