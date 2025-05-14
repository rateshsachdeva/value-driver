import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// TABLE: chat
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: varchar('userId', { length: 256 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  title: varchar('title', { length: 256 }).notNull(),
  visibility: varchar('visibility', { length: 32 }).notNull(),
});

// TABLE: message
export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  role: varchar('role', { length: 16 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// TABLE: vote
export const vote = pgTable('Vote', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: varchar('userId', { length: 256 }).notNull(),
});

// TABLE: stream
export const stream = pgTable('Stream', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// TABLE: document
export const document = pgTable('Document', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 64 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// TABLE: suggestion
export const suggestion = pgTable('Suggestion', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  documentId: uuid('documentId').notNull().references(() => document.id),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: varchar('userId', { length: 256 }).notNull(),
  field: varchar('field', { length: 128 }).notNull(),
  suggestion: text('suggestion').notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// TABLE: user
export const user = pgTable('User', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
});
