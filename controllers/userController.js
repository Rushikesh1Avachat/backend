// ==========================================
// User Controller (Normal Users)
// ==========================================

import { getAllStores, getStoreRatings, getUserStoreRating, createRating, findRatingById, updateRating } from '../services/index.js';
import { validateRating } from '../utils/index.js';

export const getAllStoresWithRatings = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Get user ID if authenticated
    const stores = await getAllStores();

    // Calculate average rating for each store
    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const storeRatings = await getStoreRatings(store.id);
        const avgRating = storeRatings.length > 0
          ? (storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length).toFixed(2)
          : 0;

        // Get user's rating for this store if authenticated
        let userRating = null;
        if (userId) {
          userRating = await getUserStoreRating(userId, store.id);
        }

        return {
          ...store,
          averageRating: avgRating,
          totalRatings: storeRatings.length,
          userRating: userRating,
        };
      })
    );

    res.status(200).json({
      success: true,
      stores: storesWithRatings,
    });
  } catch (error) {
    next(error);
  }
};

export const submitRating = async (req, res, next) => {
  try {
    const storeId = Number(req.body.storeId);
    const rating = Number(req.body.rating);
    const userId = req.user.id;

    // Validate rating
    if (!validateRating(rating)) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    // Check if already rated
    const existingRating = await getUserStoreRating(userId, storeId);
    if (existingRating) {
      const updatedRating = await updateRating(existingRating.id, { rating });
      return res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        rating: updatedRating,
      });
    }

    // Create rating
    const newRating = await createRating({
      userId,
      storeId,
      rating,
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating,
    });
  } catch (error) {
    // Handle race condition: duplicate insert can happen between check and insert
    if (error?.cause?.code === '23505' || error?.code === '23505') {
      try {
        const userId = req.user.id;
        const storeId = Number(req.body.storeId);
        const rating = Number(req.body.rating);
        const existingRating = await getUserStoreRating(userId, storeId);
        if (existingRating) {
          const updatedRating = await updateRating(existingRating.id, { rating });
          return res.status(200).json({
            success: true,
            message: 'Rating updated successfully',
            rating: updatedRating,
          });
        }
      } catch (innerError) {
        return next(innerError);
      }
    }
    next(error);
  }
};

export const updateUserRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!validateRating(rating)) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    // Get existing rating
    const existingRating = await findRatingById(id);
    if (!existingRating) {
      return res.status(404).json({ success: false, error: 'Rating not found' });
    }

    // Check ownership
    if (existingRating.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this rating' });
    }

    // Update rating
    const updatedRating = await updateRating(id, { rating });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      rating: updatedRating,
    });
  } catch (error) {
    next(error);
  }
};
