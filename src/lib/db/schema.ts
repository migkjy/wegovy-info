import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: text('category').notNull(),
  tags: text('tags'),
  author: text('author').default('편집팀'),
  sourceUrl: text('source_url'),
  sourceType: text('source_type').default('original'),
  status: text('status').default('draft'),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const pipelineQueue = sqliteTable('pipeline_queue', {
  id: text('id').primaryKey(),
  sourceType: text('source_type').notNull(),
  sourceUrl: text('source_url').notNull(),
  rawContent: text('raw_content'),
  processedContent: text('processed_content'),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const clinics = sqliteTable('clinics', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  address: text('address'),
  phone: text('phone'),
  wegovyPrice: integer('wegovy_price'),
  saxendaPrice: integer('saxenda_price'),
  mounjaroPrice: integer('mounjaro_price'),
  website: text('website'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const subscribers = sqliteTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PipelineItem = typeof pipelineQueue.$inferSelect;
export type NewPipelineItem = typeof pipelineQueue.$inferInsert;
export type Clinic = typeof clinics.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
