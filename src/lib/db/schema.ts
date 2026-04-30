import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
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
  features: text('features'),
  website: text('website'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  operatingHours: text('operating_hours'),
  naverPlaceId: text('naver_place_id'),
  googlePlaceId: text('google_place_id'),
  naverRating: real('naver_rating'),
  googleRating: real('google_rating'),
  reviewCount: integer('review_count').default(0),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  dataSource: text('data_source').default('manual'),
  glp1Drugs: text('glp1_drugs'),
  hasOnlineConsultation: integer('has_online_consultation', { mode: 'boolean' }).default(false),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const news = sqliteTable('news', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  source: text('source').notNull(),
  category: text('category'),
  drugTags: text('drug_tags'),
  publishedAt: text('published_at').notNull(),
  summary: text('summary'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const priceSubmissions = sqliteTable('price_submissions', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  drug: text('drug').notNull(),
  price: integer('price').notNull(),
  dosage: text('dosage'),
  submittedBy: text('submitted_by'),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  approvedAt: text('approved_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const dataCollectionLogs = sqliteTable('data_collection_logs', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  recordsCollected: integer('records_collected'),
  recordsInserted: integer('records_inserted'),
  recordsUpdated: integer('records_updated'),
  errors: text('errors'),
  runAt: text('run_at').default(sql`(datetime('now'))`),
});

export const subscribers = sqliteTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const snsCuration = sqliteTable('sns_curation', {
  id: text('id').primaryKey(),
  sourceUrl: text('source_url').notNull().unique(),
  sourcePlatform: text('source_platform').default('blog'),
  originalTitle: text('original_title'),
  claudeSummary: text('claude_summary'),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const communityPosts = sqliteTable('community_posts', {
  id: text('id').primaryKey(),
  nickname: text('nickname').notNull(),
  drug: text('drug').notNull(),
  content: text('content').notNull(),
  week: integer('week'),
  weightLoss: text('weight_loss'),
  ipHash: text('ip_hash'),
  status: text('status').default('visible'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PipelineItem = typeof pipelineQueue.$inferSelect;
export type NewPipelineItem = typeof pipelineQueue.$inferInsert;
export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
export type NewsItem = typeof news.$inferSelect;
export type NewNewsItem = typeof news.$inferInsert;
export type PriceSubmission = typeof priceSubmissions.$inferSelect;
export type NewPriceSubmission = typeof priceSubmissions.$inferInsert;
export type DataCollectionLog = typeof dataCollectionLogs.$inferSelect;
export type NewDataCollectionLog = typeof dataCollectionLogs.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type SnsCuration = typeof snsCuration.$inferSelect;
export type NewSnsCuration = typeof snsCuration.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type NewCommunityPost = typeof communityPosts.$inferInsert;
