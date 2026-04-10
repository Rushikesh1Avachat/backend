import { pgTable, foreignKey, serial, integer, timestamp, unique, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const role = pgEnum("role", ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])


export const ratings = pgTable("ratings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	storeId: integer("store_id").notNull(),
	rating: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ratings_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "ratings_store_id_stores_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 60 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 400 }).notNull(),
	role: role().default('NORMAL_USER').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const stores = pgTable("stores", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	address: varchar({ length: 400 }).notNull(),
	ownerId: integer("owner_id"),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "stores_owner_id_users_id_fk"
		}),
]);
