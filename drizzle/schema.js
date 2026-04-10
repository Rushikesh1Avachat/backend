import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// ==========================================
// Users Table
// ==========================================
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    address: text('address').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('admin'), // user, owner, admin
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIdx: index('users_email_idx').on(table.email),
      roleIdx: index('users_role_idx').on(table.role),
    };
  }
);

// ==========================================
// Stores Table
// ==========================================
export const stores = pgTable(
  'stores',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address').notNull(),
    ownerId: integer('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      nameIdx: index('stores_name_idx').on(table.name),
      ownerIdx: index('stores_owner_idx').on(table.ownerId),
    };
  }
);

// ==========================================
// Ratings Table
// ==========================================
export const ratings = pgTable(
  'ratings',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      userStoreIdx: unique('unique_user_store').on(table.userId, table.storeId),
      userIdx: index('ratings_user_idx').on(table.userId),
      storeIdx: index('ratings_store_idx').on(table.storeId),
    };
  }
);
