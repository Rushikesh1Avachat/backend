// ==========================================
// Database Query Services
// ==========================================

import { getDatabase } from '../config/index.js';
import { users, stores, ratings } from '../drizzle/schema.js';
import { eq, desc, like, and } from 'drizzle-orm';

// ==========================================
// USER SERVICES
// ==========================================

export const findUserByEmail = async (email) => {
  const db = getDatabase();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
};

export const findUserById = async (id) => {
const db = getDatabase();

const result = await db
.select({
id: users.id,
name: users.name,
email: users.email,
password: users.password, // ✅ FIX: include password
role: users.role,
address: users.address,
createdAt: users.createdAt,
})
.from(users)
.where(eq(users.id, Number(id)))
.limit(1);

return result[0] || null;
};


export const createUser = async (userData) => {
  const db = getDatabase();
  const result = await db.insert(users).values(userData).returning();
  return result[0];
};

export const getAllUsers = async (filters = {}) => {
  const db = getDatabase();
  let query = db.select().from(users);

  if (filters.search) {
    query = query.where(like(users.name, `%${filters.search}%`));
  }

  if (filters.role) {
    query = query.where(eq(users.role, filters.role));
  }

  return await query;
};

export const updateUser = async (id, userData) => {
  const db = getDatabase();

  const result = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, Number(id)))
    .returning();

  return result[0];
};

// ==========================================
// STORE SERVICES
// ==========================================

export const createStore = async (storeData) => {
  const db = getDatabase();
  const result = await db.insert(stores).values(storeData).returning();
  return result[0];
};

export const getAllStores = async (filters = {}) => {
  const db = getDatabase();
  let query = db.select().from(stores);

  if (filters.search) {
    query = query.where(like(stores.name, `%${filters.search}%`));
  }

  if (filters.ownerId) {
    query = query.where(eq(stores.ownerId, Number(filters.ownerId)));
  }

  return await query;
};

export const findStoreById = async (id) => {
  const db = getDatabase();

  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.id, Number(id)))
    .limit(1);

  return result[0] || null;
};

export const findStoreByName = async (name) => {
  const db = getDatabase();

  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.name, name))
    .limit(1);

  return result[0] || null;
};

export const updateStore = async (id, storeData) => {
  const db = getDatabase();

  const result = await db
    .update(stores)
    .set(storeData)
    .where(eq(stores.id, Number(id)))
    .returning();

  return result[0];
};

export const deleteStore = async (id) => {
  const db = getDatabase();
  await db.delete(stores).where(eq(stores.id, Number(id)));
};

// ==========================================
// RATING SERVICES
// ==========================================

export const createRating = async (ratingData) => {
  const db = getDatabase();
  const result = await db.insert(ratings).values(ratingData).returning();
  return result[0];
};

export const findRatingById = async (id) => {
  const db = getDatabase();

  const result = await db
    .select()
    .from(ratings)
    .where(eq(ratings.id, Number(id)))
    .limit(1);

  return result[0] || null;
};

export const updateRating = async (id, ratingData) => {
  const db = getDatabase();

  const result = await db
    .update(ratings)
    .set(ratingData)
    .where(eq(ratings.id, Number(id)))
    .returning();

  return result[0];
};

export const deleteRating = async (id) => {
  const db = getDatabase();
  await db.delete(ratings).where(eq(ratings.id, Number(id)));
};

// ✅ Improved version with JOIN
export const getStoreRatings = async (storeId) => {
  const db = getDatabase();

  return await db
    .select({
      id: ratings.id,
      rating: ratings.rating,
      userId: ratings.userId,
      storeId: ratings.storeId,
      createdAt: ratings.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(ratings)
    .innerJoin(users, eq(ratings.userId, users.id))
    .where(eq(ratings.storeId, Number(storeId)))
    .orderBy(desc(ratings.createdAt));
};

// ✅ Fix for multiple conditions
export const getUserStoreRating = async (userId, storeId) => {
  const db = getDatabase();

  const result = await db
    .select()
    .from(ratings)
    .where(
      and(
        eq(ratings.userId, Number(userId)),
        eq(ratings.storeId, Number(storeId))
      )
    )
    .limit(1);

  return result[0] || null;
};

// ==========================================
// DASHBOARD SERVICES
// ==========================================

export const getDashboardStats = async () => {
  const db = getDatabase();

  const [userCount, storeCount, ratingCount] = await Promise.all([
    db.select().from(users),
    db.select().from(stores),
    db.select().from(ratings),
  ]);

  return {
    totalUsers: userCount.length,
    totalStores: storeCount.length,
    totalRatings: ratingCount.length,
  };
};

export const getStoreAverageRating = async (storeId) => {
  const db = getDatabase();

  const storeRatings = await db
    .select()
    .from(ratings)
    .where(eq(ratings.storeId, Number(storeId)));

  if (storeRatings.length === 0) return 0;

  const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);

  return (sum / storeRatings.length).toFixed(2);
};

// ==========================================
// ALL RATINGS (ADMIN TABLE)
// ==========================================

export const getAllRatings = async (filters = {}) => {
  const db = getDatabase();

  let query = db
    .select({
      id: ratings.id,
      userId: ratings.userId,
      storeId: ratings.storeId,
      rating: ratings.rating,
      createdAt: ratings.createdAt,
      updatedAt: ratings.updatedAt,
      userName: users.name,
      userEmail: users.email,
      storeName: stores.name,
      storeAddress: stores.address,
    })
    .from(ratings)
    .innerJoin(users, eq(ratings.userId, users.id))
    .innerJoin(stores, eq(ratings.storeId, stores.id));

  if (filters.userId) {
    query = query.where(eq(ratings.userId, Number(filters.userId)));
  }

  if (filters.storeId) {
    query = query.where(eq(ratings.storeId, Number(filters.storeId)));
  }

  if (filters.userEmail) {
    query = query.where(eq(users.email, filters.userEmail));
  }

  if (filters.storeName) {
    query = query.where(eq(stores.name, filters.storeName));
  }

  return await query;
};