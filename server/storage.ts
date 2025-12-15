import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertGroup, Group, InsertLink, Link } from "@shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // Groups
  getAllGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  deleteGroup(id: string): Promise<void>;
  
  // Links
  getAllLinks(): Promise<Link[]>;
  getLinksByGroup(groupId: string): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  deleteLink(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Groups
  async getAllGroups(): Promise<Group[]> {
    return db.select().from(schema.groups).orderBy(schema.groups.order);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(schema.groups).values(group).returning();
    return newGroup;
  }

  async deleteGroup(id: string): Promise<void> {
    await db.delete(schema.groups).where(eq(schema.groups.id, id));
  }

  // Links
  async getAllLinks(): Promise<Link[]> {
    return db.select().from(schema.links).orderBy(schema.links.createdAt);
  }

  async getLinksByGroup(groupId: string): Promise<Link[]> {
    return db.select().from(schema.links).where(eq(schema.links.groupId, groupId));
  }

  async createLink(link: InsertLink): Promise<Link> {
    const [newLink] = await db.insert(schema.links).values(link).returning();
    return newLink;
  }

  async deleteLink(id: string): Promise<void> {
    await db.delete(schema.links).where(eq(schema.links.id, id));
  }
}

export const storage = new DatabaseStorage();
