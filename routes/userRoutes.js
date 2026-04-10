// ==========================================
// User Routes
// ==========================================

import express from 'express';
import { getAllStoresWithRatings, submitRating, updateUserRating } from '../controllers/userController.js';
import { getOwnerStores, createOwnerStore, updateOwnerStore, deleteOwnerStore } from '../controllers/storeController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stores', getAllStoresWithRatings);
router.post('/ratings', authenticate, submitRating);
router.put('/ratings/:id', authenticate, updateUserRating);

// User store management routes
router.get('/user/stores', authenticate, getOwnerStores);
router.post('/user/stores', authenticate, createOwnerStore);
router.put('/user/stores/:id', authenticate, updateOwnerStore);
router.delete('/user/stores/:id', authenticate, deleteOwnerStore);

export default router;
