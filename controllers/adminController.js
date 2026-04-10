// ==========================================
// Admin Controller (FINAL FIXED)
// ==========================================

import {
  getDashboardStats,
  getAllUsers,
  getAllStores,
  createUser,
  createStore,
  findUserByEmail,
  findStoreByName,
  createRating,
  updateStore,
  deleteStore,
  updateUser,
  getStoreRatings,
  updateRating,
  getAllRatings as getAllRatingsService,
  findUserById,
  findStoreById,
  getUserStoreRating
} from '../services/index.js';

import {
  hashPassword,
  validateUser,
  validateStore,
  validateRating
} from '../utils/index.js';

// ==========================================
// Dashboard
// ==========================================
export const getDashboard = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Users
// ==========================================
export const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;

    const allUsers = await getAllUsers({ search, role });

    res.status(200).json({
      success: true,
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Create User
// ==========================================
export const createUserAdmin = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const validation = validateUser({ name, email, password, address, role });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Stores (🔥 FIXED - MAIN ISSUE)
// ==========================================
export const getStores = async (req, res, next) => {
  try {
    const { search } = req.query;

    const stores = await getAllStores({ search });

    // 🔥 ENRICH DATA (EMAIL + RATING)
    const enrichedStores = await Promise.all(
      stores.map(async (store) => {
        const owner = await findUserById(store.ownerId);
        const ratings = await getStoreRatings(store.id);

        const avgRating =
          ratings.length > 0
            ? (
                ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                ratings.length
              ).toFixed(2)
            : '0.00';

        return {
          ...store,
          email: owner?.email || null,
          averageRating: Number(avgRating),
        };
      })
    );

    res.status(200).json({
      success: true,
      stores: enrichedStores,
      count: enrichedStores.length,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Create Store (🔥 RETURN FULL DATA)
// ==========================================
export const createStoreAdmin = async (req, res, next) => {
  try {
    const { name, address, ownerEmail } = req.body;

    const validation = validateStore({ name, address, ownerEmail });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    let ownerId = req.user.id;

    if (ownerEmail) {
      const owner = await findUserByEmail(ownerEmail);
      if (owner) {
        ownerId = owner.id;
      }
    }

    const store = await createStore({
      name,
      address,
      ownerId,
    });

    const owner = await findUserById(ownerId);

    return res.status(201).json({
      success: true,
      store: {
        ...store,
        email: owner?.email || null,
        averageRating: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Update Store
// ==========================================
export const updateStoreAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, email, averageRating } = req.body;

    const store = await findStoreById(Number(id));
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    const validation = validateStore({ name, address, ownerEmail: email });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const updatedStore = await updateStore(Number(id), { name, address });

    // 🔥 UPDATE OWNER EMAIL
    if (email) {
      const owner = await findUserById(store.ownerId);
      if (owner) {
        await updateUser(owner.id, {
          email: String(email).trim().toLowerCase(),
        });
      }
    }

    // 🔥 UPDATE RATING
    if (averageRating !== undefined && averageRating !== '') {
      const parsedRating = Number(averageRating);

      if (!validateRating(parsedRating)) {
        return res.status(400).json({
          success: false,
          error: 'Average rating must be between 1 and 5',
        });
      }

      const existing = await getUserStoreRating(req.user.id, Number(id));

      if (existing) {
        await updateRating(existing.id, { rating: parsedRating });
      } else {
        await createRating({
          userId: req.user.id,
          storeId: Number(id),
          rating: parsedRating,
        });
      }
    }

    // 🔥 RECALCULATE FINAL DATA
    const owner = await findUserById(store.ownerId);
    const ratings = await getStoreRatings(Number(id));

    const avgRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
            ratings.length
          ).toFixed(2)
        : '0.00';

    return res.status(200).json({
      success: true,
      store: {
        ...updatedStore,
        email: owner?.email || null,
        averageRating: Number(avgRating),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Delete Store
// ==========================================
export const deleteStoreAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await findStoreById(Number(id));
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    await deleteStore(Number(id));

    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Create Rating
// ==========================================
export const createRatingAdmin = async (req, res, next) => {
  try {
    const { userId, storeId, userEmail, storeName, rating } = req.body;

    const parsedRating = Number(rating);

    if (!validateRating(parsedRating)) {
      return res.status(400).json({ success: false, error: 'Rating must be 1–5' });
    }

    let user =
      userId
        ? await findUserById(Number(userId))
        : await findUserByEmail(userEmail);

    let store =
      storeId
        ? await findStoreById(Number(storeId))
        : await findStoreByName(storeName);

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    const existing = await getUserStoreRating(user.id, store.id);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already rated' });
    }

    const newRating = await createRating({
      userId: user.id,
      storeId: store.id,
      rating: parsedRating,
    });

    res.status(201).json({
      success: true,
      rating: newRating,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Get All Ratings
// ==========================================
export const getAllRatings = async (req, res, next) => {
  try {
    const { search } = req.query;

    const ratings = await getAllRatingsService({ search });

    res.status(200).json({
      success: true,
      ratings,
      count: ratings.length,
    });
  } catch (error) {
    next(error);
  }
};