import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

// 👤 User table
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  name: varchar('name', { length: 64 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// 💬 Chat table
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: uuid('userId').notNull().references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
});

// 📨 Message table (renamed to avoid conflict)
export const chatMessage = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  role: varchar('role', { length: 16 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
