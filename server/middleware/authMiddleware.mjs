import mongoose from 'mongoose';

/**
 * Helper function to validate and convert user ID to MongoDB ObjectId
 * @param {string} id - The user ID to validate
 * @returns {mongoose.Types.ObjectId|null} - The MongoDB ObjectId or null if invalid
 */
const validateUserId = (id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (error) {
    console.error('Error validating user ID:', error);
    return null;
  }
};

/**
 * Middleware to check if the user is authenticated
 * Populates req.auth with the session if authenticated
 */
export const requireAuth = async (req, res, next) => {
  // Bypassing all authentication checks
  console.warn("Authentication is currently bypassed in requireAuth middleware. This should not be used in production.");

  // Optionally, you can still try to get a userId from a header if you plan to pass it for non-auth purposes
  const userIdFromHeader = req.headers['x-user-id']; // Example: use a custom header

  if (userIdFromHeader) {
    const validatedId = validateUserId(userIdFromHeader);
    if (validatedId) {
      req.user = { id: validatedId }; // Set req.user instead of req.auth
      console.log(`User ID '${validatedId}' provided in x-user-id header.`);
    } else {
      console.warn(`Invalid user ID '${userIdFromHeader}' provided in x-user-id header. Proceeding without user context.`);
      req.user = null;
    }
  } else {
    console.log("No x-user-id header provided. Proceeding without user context.");
    req.user = null;
  }

  return next();
};


/**
 * Middleware to simulate user authentication for development purposes.
 * It expects a 'X-User-ID' header containing the MongoDB ObjectId of the user.
 * If the header is present and valid, it populates `req.user` (or `req.auth.user` if you prefer).
 * IMPORTANT: This is NOT secure and should ONLY be used in controlled development environments.
 */
export const developmentAuthMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id']; // Or 'authorization' if you want to send it as a Bearer token-like string

  if (!userId) {
    // Allow request to proceed without user context, or deny if user context is always required
    // console.warn('AuthBypass: No X-User-ID header provided.');
    // For routes that strictly need a user, you might return an error:
    // return res.status(401).json({ message: 'AuthBypass: X-User-ID header is required for this route.' });
    req.user = null; // Or req.auth = { user: null };
    return next();
  }

  if (mongoose.Types.ObjectId.isValid(userId)) {
    req.user = { id: new mongoose.Types.ObjectId(userId) };
    // Or, to mimic the structure of next-auth session more closely:
    // req.auth = { user: { id: new mongoose.Types.ObjectId(userId) } };
    // console.log(`AuthBypass: Authenticated as user ${userId}`);
  } else {
    // console.warn(`AuthBypass: Invalid X-User-ID format: ${userId}`);
    // return res.status(400).json({ message: 'AuthBypass: Invalid X-User-ID format.' });
    req.user = null; // Or req.auth = { user: null };
  }
  next();
};


// Keep authMiddleware as an alias for requireAuth or developmentAuthMiddleware
// For complete removal of auth logic, point it to a pass-through middleware.
// export const authMiddleware = requireAuth; // Original
export const authMiddleware = developmentAuthMiddleware; // For development bypass

// If you want to completely disable any auth logic processing and just pass through:
// export const authMiddleware = (req, res, next) => next();


/**
 * Optional: Middleware to check if the authenticated user is an admin
 * This would require you to have a way to identify admin users (e.g., a role field in your User model)
 */
// export const requireAdmin = (req, res, next) => {
//   if (!req.auth || !req.auth.user) {
//     return res.status(401).json({ message: 'Authentication required.' });
//   }
//   // Example: Check for an admin role (you'll need to fetch user details if not in session)
//   // const user = await User.findById(req.auth.user.id);
//   // if (user && user.role === 'admin') {
//   //   return next();
//   // }
//   return res.status(403).json({ message: 'Admin access required.' });
// };

// Example of how you might have used it before:
// router.get('/admin-only', requireAuth, requireAdmin, (req, res) => { ... });

// After removing auth, such a route would need to be re-evaluated.
// If you still need to differentiate users (e.g. by a role passed in a header),
// you would adapt the logic. For now, this is commented out.

console.log("Auth middleware module loaded. Current mode: Development Auth Bypass (expects X-User-ID header).");
