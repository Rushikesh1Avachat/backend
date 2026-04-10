import { relations } from "drizzle-orm/relations";
import { users, ratings, stores } from "./schema";

export const ratingsRelations = relations(ratings, ({one}) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id]
	}),
	store: one(stores, {
		fields: [ratings.storeId],
		references: [stores.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	ratings: many(ratings),
	stores: many(stores),
}));

export const storesRelations = relations(stores, ({one, many}) => ({
	ratings: many(ratings),
	user: one(users, {
		fields: [stores.ownerId],
		references: [users.id]
	}),
}));