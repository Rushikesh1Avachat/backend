// ==========================================
// Admin Routes
// ==========================================

import express from 'express';
import {
  getDashboard,
  getUsers,
  createUserAdmin,
  getStores,
  createStoreAdmin,
  updateStoreAdmin,
  deleteStoreAdmin,
  createRatingAdmin,
  getAllRatings,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['admin', 'owner', 'user']), getDashboard);
router.get('/users', authenticate, authorize(['admin']), getUsers);
router.post('/create-user', authenticate, authorize(['admin']), createUserAdmin);
router.get('/stores', authenticate, authorize(['admin']), getStores);
router.post('/create-store', authenticate, authorize(['admin']), createStoreAdmin);
router.put('/stores/:id', authenticate, authorize(['admin']), updateStoreAdmin);
router.delete('/stores/:id', authenticate, authorize(['admin']), deleteStoreAdmin);
router.post('/create-rating', authenticate, authorize(['admin']), createRatingAdmin);
router.get('/ratings', authenticate, authorize(['admin']), getAllRatings);

export default router;
