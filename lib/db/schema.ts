import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/* ------------------------------------------------------------------ */
/*  Shared / utility                                                  */
/* ------------------------------------------------------------------ */

export const VISIBILITY_TYPES = ['private', 'public'] as const;
export type VisibilityType = (typeof VISIBILITY_TYPES)[number];

/* ------------------------------------------------------------------ */
/*  chat                                                              */
/* ------------------------------------------------------------------ */

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: varchar('userId', { length: 256 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  title: varchar('title', { length: 256 }).notNull(),
  visibility: varchar('visibility', { length: 32 }).notNull(),
});

export type Chat = typeof chat.$inferSelect;
export type ChatInsert = typeof chat.$inferInsert;

/* ------------------------------------------------------------------ */
/*  message                                                           */
/* ------------------------------------------------------------------ */

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  role: varchar('role', { length: 16 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Message = typeof message.$inferSelect;
export type MessageInsert = typeof message.$inferInsert;

/* ------------------------------------------------------------------ */
/*  vote                                                              */
/* ------------------------------------------------------------------ */

export const vote = pgTable('Vote', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: varchar('userId', { length: 256 }).notNull(),
});

export type Vote = typeof vote.$inferSelect;
export type VoteInsert = typeof vote.$inferInsert;

/* ------------------------------------------------------------------ */
/*  stream                                                            */
/* ------------------------------------------------------------------ */

export const stream = pgTable('Stream', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Stream = typeof stream.$inferSelect;
export type StreamInsert = typeof stream.$inferInsert;

/* ------------------------------------------------------------------ */
/*  document                                                          */
/* ------------------------------------------------------------------ */

export const document = pgTable('Document', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 64 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Document = typeof document.$inferSelect;
export type DocumentInsert = typeof document.$inferInsert;

/* ------------------------------------------------------------------ */
/*  suggestion                                                        */
/* ------------------------------------------------------------------ */

export const suggestion = pgTable('Suggestion', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  documentId: uuid('documentId').notNull().references(() => document.id),
  messageId: uuid('messageId').notNull().references(() => message.id),
  userId: varchar('userId', { length: 256 }).notNull(),
  field: varchar('field', { length: 128 }).notNull(),
  suggestion: text('suggestion').notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  description: text('description'), // ✅ Add this line
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

/** Row returned by `SELECT * FROM "Suggestion"` */
export type Suggestion = typeof suggestion.$inferSelect;
/** Shape accepted by `INSERT INTO "Suggestion"` (all cols optional) */
export type SuggestionInsert = typeof suggestion.$inferInsert;

/* ------------------------------------------------------------------ */
/*  user                                                              */
/* ------------------------------------------------------------------ */

export const user = pgTable('User', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  password: varchar('password', { length: 256 }).notNull(),

});

export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;
