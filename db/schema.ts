import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const activities = sqliteTable('activities', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), kind:text('kind').notNull(), ref:text('ref').notNull(), title:text('title').notNull(), quantity:integer('quantity').notNull().default(0), location:text('location').notNull().default(''), diet:text('diet').notNull().default('Vegetarian'), deadline:text('deadline'), notes:text('notes').notNull().default(''), status:text('status').notNull().default('saved'), createdAt:text('created_at').notNull()
}, t=>[uniqueIndex('activities_user_ref').on(t.userId,t.ref)]);
