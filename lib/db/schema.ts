import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'

// --- Chat Table ---
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  visibility: varchar('visibility', { length: 10 }).notNull()
})

// --- Message Table ---
export const message = pgTable('Message', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  role: varchar('role', { length: 16 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull()
})

// --- Vote Table ---
export const vote = pgTable('Vote', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: text('userId').notNull()
})

// --- Stream Table ---
export const stream = pgTable('Stream', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  createdAt: timestamp('createdAt').defaultNow().notNull()
})

// --- Document Table ---
export const document = pgTable('Document', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
})

// --- Suggestion Table ---
export const suggestion = pgTable('Suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('documentId').notNull().references(() => document.id),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: text('userId').notNull(),
  field: text('field').notNull(),
  suggestion: text('suggestion').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
})
