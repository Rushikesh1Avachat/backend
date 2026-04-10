// ==========================================
// Database Configuration
// ==========================================

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import config from './env.js';

let db = null;

export const initializeDatabase = async () => {
  try {
    const pool = new Pool({
      connectionString: config.DATABASE_URL,
    });

    db = drizzle(pool);
    console.log('✅ Database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};
