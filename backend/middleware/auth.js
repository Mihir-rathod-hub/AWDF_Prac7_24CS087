const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Practical 7: Verifies JWT in Authorization header and populates req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Validate Authorization header presence and format
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization header must be provided in Bearer token format.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim().length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Bearer token cannot be empty.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth Error] JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Authentication secret is not configured.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: Token has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid or malformed token.'
      });
    }

    // Ensure token contains valid user ID
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Token payload is invalid.'
      });
    }

    // Fetch user from DB, excluding password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User account associated with this token no longer exists.'
      });
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
