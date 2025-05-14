import { getSession } from '@auth/express';
import { authConfig } from '../auth.config.mjs';
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
  try {
    // 1. Attempt to get session from cookie (primary method)
    const session = await getSession(req, authConfig);

    console.log(req.headers); // For debugging
    console.log('Session cookie:', req.cookies); // For debugging

    console.log('Session:', session); // For debugging

    if (session && session.user) {
      if (session.user.id) {
        const validatedId = validateUserId(session.user.id);
        if (validatedId) {
          session.user.id = validatedId;
        } else {
          console.warn(`Invalid user ID ('${session.user.id}') in session cookie. Access denied.`);
          return res.status(401).json({ message: 'Invalid user ID in session cookie.' });
        }
      } else {
        console.warn('User ID missing in session cookie. Access denied.');
        return res.status(401).json({ message: 'User ID missing in session cookie.' });
      }
      
      req.auth = session;
      // console.log('Authenticated via session cookie.'); // For debugging
      return next();
    }

    // 2. If no cookie session, try Bearer token (fallback, if present)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // console.log('Attempting authentication via Bearer token.'); // For debugging
      try {
        let payload;
        const parts = token.split('.');
        if (parts.length === 3) { // Assumes JWS
          const base64Payload = parts[1];
          const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
          const padding = '='.repeat((4 - base64.length % 4) % 4);
          let jsonPayload;
          try {
            jsonPayload = Buffer.from(base64 + padding, 'base64').toString('utf-8');
          } catch (bufferError) {
            console.error('Error during Buffer.from or toString for Bearer token payload:', bufferError);
            return res.status(401).json({ message: 'Invalid Bearer token: payload decoding error.' });
          }

          try {
            payload = JSON.parse(jsonPayload);
          } catch (parseError) {
            console.error('Failed to parse Bearer token JSON payload:', parseError);
            console.debug('Problematic jsonPayload for Bearer token:', jsonPayload); // Log the string that failed parsing
            return res.status(401).json({ message: 'Invalid Bearer token: malformed payload.' });
          }

        } else {
          console.warn('Bearer token is not in expected JWT format (3 parts). Token:', token);
          return res.status(401).json({ message: 'Invalid Bearer token: unexpected format.' });
        }
        
        const userId = payload.sub || payload.id || payload.userId;
        if (!userId) {
          console.warn('No user ID (sub, id, userId) found in Bearer token payload:', payload);
          return res.status(401).json({ message: 'User ID not found in Bearer token.' });
        }
        
        const validatedId = validateUserId(userId);
        if (!validatedId) {
          console.warn(`Invalid MongoDB ID ('${userId}') in Bearer token. Access denied.`);
          return res.status(400).json({ message: 'Invalid user ID format in Bearer token.' });
        }
        
        req.auth = {
          user: {
            id: validatedId,
            name: payload.name || 'User',
            email: payload.email,
            ...(payload.user || {}) // Spread other potential user details from token
          }
        };
        // console.log('Authenticated via Bearer token.'); // For debugging
        return next();
      } catch (error) { // Catch any unexpected errors from Bearer token processing
        console.error('Unexpected error during Bearer token processing:', error);
        return res.status(401).json({ message: 'Invalid or unprocessable authorization token.' });
      }
    }
    
    // 3. If neither cookie session nor Bearer token authentication was successful
    // console.log('No authentication method succeeded.'); // For debugging
    return res.status(401).json({ message: 'Unauthorized - Please sign in. No valid session or token provided.' });

  } catch (error) { // Catch errors from getSession or other top-level issues
    console.error('Overall auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication processing error.' });
  }
};

/**
 * Middleware to optionally check authentication
 * Populates req.auth with the session if authenticated, but doesn't reject unauthenticated requests
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // 1. Attempt to get session from cookie
    const session = await getSession(req, authConfig);
    if (session && session.user) {
      if (session.user.id) {
        const validatedId = validateUserId(session.user.id);
        if (validatedId) {
          session.user.id = validatedId;
          req.auth = session; // Set req.auth only if ID is valid
        } else {
          console.warn(`Invalid user ID ('${session.user.id}') in optional auth session cookie. Proceeding without auth for this session.`);
        }
      } else {
        // If user.id is not present, but session exists, we can still set req.auth
        // if the presence of a session (even without a specific ID) is meaningful
        req.auth = session;
      }
      return next();
    }

    // 2. If no cookie session, try Bearer token (optional)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        let payload;
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Payload = parts[1];
          const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
          const padding = '='.repeat((4 - base64.length % 4) % 4);
          let jsonPayload;
          try {
            jsonPayload = Buffer.from(base64 + padding, 'base64').toString('utf-8');
            payload = JSON.parse(jsonPayload);

            const userId = payload.sub || payload.id || payload.userId;
            if (userId) {
              const validatedId = validateUserId(userId);
              if (validatedId) {
                req.auth = {
                  user: {
                    id: validatedId,
                    name: payload.name || 'User',
                    email: payload.email,
                    ...(payload.user || {})
                  }
                };
              } else {
                console.warn(`Invalid user ID ('${userId}') in optional auth Bearer token. Proceeding without auth for this token.`);
              }
            }
          } catch (e) {
            console.warn('Failed to decode/parse optional auth Bearer token, proceeding without auth:', e.message);
          }
        } else {
            console.warn('Optional auth Bearer token not in JWT format, proceeding without auth.');
        }
      } catch (error) {
        console.warn('Error processing optional auth Bearer token, proceeding without auth:', error.message);
      }
    }
    return next(); // Always call next for optionalAuth
  } catch (error) {
    console.warn('Overall optionalAuth middleware error, proceeding without auth:', error.message);
    next(); // Proceed without authentication in case of error
  }
};
