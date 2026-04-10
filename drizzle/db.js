import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // ✅ Neon fix
});

pool
  .connect()
  .then(() => console.log('✅ Database Connected'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

export const db = drizzle(pool, { schema });
