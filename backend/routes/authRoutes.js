const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Helper: Validate standard email format
 */
function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim());
}

/**
 * POST /auth/register
 * Register a new user with email and hashed password (10 salt rounds)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};

    const errors = {};

    // Validate name
    if (name === undefined || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Full name is required and cannot be empty.';
    }

    // Validate email
    if (email === undefined || typeof email !== 'string' || email.trim().length === 0) {
      errors.email = 'Email is required and cannot be empty.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    // Validate password
    if (password === undefined || typeof password !== 'string') {
      errors.password = 'Password is required and must be a string.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // Return 400 if validation failed
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: {
          email: 'An account with this email address already exists.'
        }
      });
    }

    // Create and save new user (pre-save hook hashes password with 10 rounds)
    const user = new User({
      email: normalizedEmail,
      password: password,
      name: typeof name === 'string' ? name.trim() : ''
    });

    await user.save();

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Authenticate user credentials, compare password hash, and return JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const errors = {};

    if (email === undefined || typeof email !== 'string' || email.trim().length === 0) {
      errors.email = 'Email is required.';
    }
    if (password === undefined || typeof password !== 'string' || password.length === 0) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password with bcrypt.compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Sign JWT token with 1h expiry
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Protected route returning authenticated user profile (excluding password)
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
