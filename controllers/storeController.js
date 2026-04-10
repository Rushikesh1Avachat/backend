// ==========================================
// Store Owner Controller
// ==========================================

import {
  getAllStores,
  getStoreRatings,
  getUserStoreRating,
  findUserById,
  findUserByEmail,
  createStore,
  updateStore,
  deleteStore,
  findStoreById,
  updateUser,
  createRating,
  updateRating,
} from '../services/index.js';
import { validateStore, validateRating } from '../utils/index.js';

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // ✅ USE EXISTING SERVICE
    const stores = await getAllStores({ ownerId });

    res.status(200).json({
      success: true,
      totalStores: stores.length, // ✅ FIXED
    });

  } catch (error) {
    next(error);
  }
};
// Get owner's stores
export const getOwnerStores = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { search } = req.query;

    const stores = await getAllStores({ ownerId, search });
    const owner = await findUserById(ownerId);

    const storesWithDetails = await Promise.all(
      stores.map(async (store) => {
        const ratings = await getStoreRatings(store.id);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / ratings.length).toFixed(2)
          : '0.00';

        const userRating = await getUserStoreRating(ownerId, store.id);

        return {
          ...store,
          email: owner?.email || null,
          averageRating: Number(avgRating),
          ratingCount: ratings.length,
          userRating: userRating || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      stores: storesWithDetails,
      count: storesWithDetails.length,
    });
  } catch (error) {
    next(error);
  }
};

// Create store for owner
export const createOwnerStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { name, address } = req.body;

    const validation = validateStore({ name, address });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const newStore = await createStore({
      name,
      address,
      ownerId,
    });

    res.status(201).json({
      success: true,
      store: newStore,
    });
  } catch (error) {
    next(error);
  }
};

// Update owner's store
export const updateOwnerStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { name, address, email, averageRating } = req.body;

    const validation = validateStore({ name, address });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    // Check if store belongs to owner
    const store = await findStoreById(id);
    if (!store || store.ownerId !== ownerId) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    const updatedStore = await updateStore(id, { name, address });

    if (email && String(email).trim()) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ success: false, error: 'Enter a valid email' });
      }

      const existingUser = await findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== ownerId) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }

      await updateUser(ownerId, { email: normalizedEmail });
    }

    if (averageRating !== undefined && averageRating !== null && averageRating !== '') {
      const ratingValue = Number(averageRating);
      if (!validateRating(ratingValue)) {
        return res.status(400).json({ success: false, error: 'Average rating must be between 1 and 5' });
      }

      const existingUserRating = await getUserStoreRating(ownerId, Number(id));
      if (existingUserRating) {
        await updateRating(existingUserRating.id, { rating: ratingValue });
      } else {
        await createRating({
          userId: ownerId,
          storeId: Number(id),
          rating: ratingValue,
        });
      }
    }

    const owner = await findUserById(ownerId);
    const ratings = await getStoreRatings(Number(id));
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / ratings.length).toFixed(2)
      : '0.00';
    const userRating = await getUserStoreRating(ownerId, Number(id));

    res.status(200).json({
      success: true,
      store: {
        ...updatedStore,
        email: owner?.email || null,
        averageRating: Number(avgRating),
        ratingCount: ratings.length,
        userRating: userRating || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete owner's store
export const deleteOwnerStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    // Check if store belongs to owner
    const store = await findStoreById(id);
    if (!store || store.ownerId !== ownerId) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    await deleteStore(id);

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
