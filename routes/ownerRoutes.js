// ==========================================
// Store Owner Routes
// ==========================================

import express from 'express';
import { getOwnerDashboard, getOwnerStores, createOwnerStore, updateOwnerStore, deleteOwnerStore } from '../controllers/storeController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['owner']), getOwnerDashboard);
router.get('/stores', authenticate, authorize(['owner']), getOwnerStores);
router.post('/stores', authenticate, authorize(['owner']), createOwnerStore);
router.put('/stores/:id', authenticate, authorize(['owner']), updateOwnerStore);
router.delete('/stores/:id', authenticate, authorize(['owner']), deleteOwnerStore);

export default router;
