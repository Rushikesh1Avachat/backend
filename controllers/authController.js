// ==========================================
// Authentication Controller
// ==========================================

import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, updateUser, findUserById } from '../services/index.js';
import { hashPassword, comparePassword, validateRegistration, validateLogin } from '../utils/index.js';
import config from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validate input
    const validation = validateRegistration({ name, email, password, address, role });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'user',
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
try {
const { oldPassword, newPassword } = req.body;
const userId = req.user?.id;


// =========================
// Validate input
// =========================
if (!oldPassword || !newPassword) {
  return res.status(400).json({
    success: false,
    error: "Old password and new password are required",
  });
}

if (newPassword.length < 8) {
  return res.status(400).json({
    success: false,
    error: "Password must be at least 8 characters",
  });
}

// =========================
// Get user (IMPORTANT: include password)
// =========================
const user = await findUserById(userId);

if (!user) {
  return res.status(404).json({
    success: false,
    error: "User not found",
  });
}

if (!user.password) {
  return res.status(500).json({
    success: false,
    error: "User password not found in DB",
  });
}

// =========================
// Compare old password
// =========================
const isMatch = await comparePassword(oldPassword, user.password);

if (!isMatch) {
  return res.status(401).json({
    success: false,
    error: "Current password is incorrect",
  });
}

// =========================
// Hash new password
// =========================
const hashedPassword = await hashPassword(newPassword);

// =========================
// Update password
// =========================
await updateUser(userId, { password: hashedPassword });

return res.status(200).json({
  success: true,
  message: "Password changed successfully",
});


} catch (error) {
console.error("Change Password Error:", error);
next(error);
}
};

