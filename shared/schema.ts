import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  bannedUntil: integer("banned_until", { mode: "timestamp" }),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  note: text("note"),
  isPinned: integer("is_pinned").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  groupId: text("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true });
export const insertLinkSchema = createInsertSchema(links).omit({ id: true, createdAt: true, isPinned: true, clickCount: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;
export type Session = typeof sessions.$inferSelect;
