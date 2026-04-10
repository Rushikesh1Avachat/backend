// ==========================================
// Authentication Routes
// ==========================================

import express from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', register);
router.post('/register', register); // Alias for signup
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

export default router;
