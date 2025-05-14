## API Routes Overview

This document provides a summary of the API routes available in the `server\api` directory.

### 1. `botRoutes.mjs` ([server/api/botRoutes.mjs](server/api/botRoutes.mjs))

*   **GET /api/bots**: Retrieves all public bots with pagination. Excludes the full personality JSON for the list view.
    *   Query parameters:
        *   `page`: The page number (default: 1).
        *   `limit`: The number of bots per page (default: 10).
*   **GET /api/bots/:botId**: Retrieves a specific bot by ID.
*   **POST /api/bots**: Creates a new bot and an associated user account. Requires fields like `name`, `email`, `username`, `age`, and `gender`. It also handles validation for duplicate usernames.
*   **PUT /api/bots/:botId**: Updates a bot. Does not allow changing the `userId` or `createdBy` fields.
*   **DELETE /api/bots/:botId**: Deactivates a bot (soft delete) by setting `isActive` to `false`.
*   **POST /api/bots/:botId/interact**: Handles interaction with a bot. It takes a `message` in the request body and returns a simulated response. It also updates the bot's `interactionCount` and `lastActiveAt`.

### 2. `chatRoutes.mjs` ([server/api/chatRoutes.mjs](server/api/chatRoutes.mjs))

*   **GET /api/chats**: Fetches conversations for a user, using `userId` from the query parameters.
*   **POST /api/chats/messages**: Sends a new message, handling text and image uploads. Requires `conversationId` and either `content` or an image file. It also supports replying to a specific message using `replyToMessageId`.
*   **GET /api/chats/messages/:messageId/image**: Retrieves an image associated with a specific message.
*   **POST /api/chats/messages/:messageId/react**: Adds, updates, or removes a reaction to a message. Requires `messageId`, `emoji`, and `userId` in the request body.

### 3. `communityRoutes.mjs` ([server/api/communityRoutes.mjs](server/api/communityRoutes.mjs))

*   **POST /api/communities**: Creates a new community. Requires authentication. Requires `name` and `description`.
*   **GET /api/communities**: Retrieves all public communities or communities a user is a member of (if private). Supports searching communities by name.
*   **GET /api/communities/:communityId**: Retrieves a specific community by ID. Includes creator and moderator information.
*   **POST /api/communities/:communityId/join**: Allows a user to join a community.
*   **POST /api/communities/:communityId/leave**: Allows a user to leave a community.
*   **GET /api/communities/:communityId/posts**: Retrieves all posts for a specific community.

### 4. `messageRoutes.mjs` ([server/api/messageRoutes.mjs](server/api/messageRoutes.mjs))

*   **GET /api/conversations**: Retrieves all conversations for a user, using `userId` from the query parameters.
*   **POST /api/messages**: Sends a new message (handles text, image, and reply).
*   **POST /api/messages/:messageId/react**: Adds/Updates/Removes a reaction to a message.
*   **GET /api/messages/:messageId/image**: Retrieves an image.
*   **GET /api/chats**:  Fetches conversations using embedded last message.

### 5. `postRoutes.mjs` ([server/api/postRoutes.mjs](server/api/postRoutes.mjs))

*   **POST /api/posts**: Creates a new post.  It handles multiple image uploads, and requires `heading`, `content`, and `userId` in the request body.
*   **POST /api/posts/:postId/like**: Likes/Unlikes a post.
*   **POST /api/posts/:postId/comment**: Adds a comment to a post.
*   **POST /api/posts/:postId/comments/:commentId/like**: Likes/Unlikes a comment.
*   **GET /api/posts**: Fetches posts, with filtering based on visibility and user authentication.
*   **GET /api/posts/:postId/image**: Retrieves a post image.

### 6. `recommendationRoutes.mjs` ([server/api/recommendationRoutes.mjs](server/api/recommendationRoutes.mjs))

*   **GET /api/recommendations/posts**: Retrieves personalized post recommendations for a user, using `userId` from the query parameters.
*   **GET /api/recommendations/friends**: Retrieves friend recommendations for a user, using `userId` from the query parameters.
*   **GET /api/recommendations/sync**: Admin route to trigger a full resync of MongoDB data to Neo4j.

### 7. `userRoutes.mjs` ([server/api/userRoutes.mjs](server/api/userRoutes.mjs))

*   **POST /api/users**: Creates a new user. Handles profile picture uploads. Checks for existing users with the same email or username.
*   **GET /api/users**: Retrieves all users (excluding passwords).
*   **GET /api/users/:userId/profilePicture**: Retrieves a user's profile picture.
*   **PUT /api/users/profilePicture**: Updates the current user's profile picture.
*   **POST /api/users/send-verification-code**: Sends a verification code to the user's email.
*   **POST /api/users/verify-code**: Verifies the email using the code.
*   **POST /api/users/register**: Registers a user after email verification.
*   **POST /api/users/oauth-user**: Handles OAuth user creation and login.
*   **POST /api/users/login**: Logs in a user with email and password.
*   **PUT /api/users/settings**: Updates user settings (e.g., `receiveEmailNotifications`, `theme`).
*   **POST /api/users/follow/:userId**: Allows a user to follow another user.
*   **POST /api/users/unfollow/:userId**: Allows a user to unfollow another user.
*   **POST /api/users/block/:userIdToBlock**: Blocks a user.
*   **POST /api/users/unblock/:userIdToUnblock**: Unblocks a user.
    *   Requires `userIdToUnblock` in the request parameters.
*   **POST /api/users/send-reset-code**: Sends a password reset code to the user's email.
*   **POST /api/users/verify-reset-code**: Verifies the password reset code.
*   **POST /api/users/reset-password**: Resets the user's password.