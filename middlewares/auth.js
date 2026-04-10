// ==========================================
// Authentication & Authorization Middleware
// ==========================================

import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Verify JWT token from Authorization header
 * Adds user data to req.user
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login first.',
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }
};

/**
 * Check if user has allowed role
 * Usage: authorize(['admin', 'owner'])(req, res, next)
 */
export const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
    });
  }

  next();
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (config.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler middleware
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
};
