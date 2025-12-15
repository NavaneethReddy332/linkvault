import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  title: text("title").notNull(),
  note: text("note"),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  createdAt: bigint("created_at", { mode: 'number' }).notNull().default(sql`extract(epoch from now()) * 1000`),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true });
export const insertLinkSchema = createInsertSchema(links).omit({ id: true, createdAt: true });

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;
