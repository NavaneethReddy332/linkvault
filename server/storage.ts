import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { InsertGroup, Group, InsertLink, Link, User, Session } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'bannedUntil'>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  banUser(id: string, until: Date): Promise<void>;
  
  // Sessions
  createSession(userId: string): Promise<Session>;
  getSession(id: string): Promise<(Session & { user: User }) | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  
  // Groups
  getGroupsByUser(userId: string): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  deleteGroup(id: string, userId: string): Promise<void>;
  
  // Links
  getLinksByUser(userId: string): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  deleteLink(id: string, userId: string): Promise<void>;
  deleteAllLinksByUser(userId: string): Promise<void>;
  countLinksByUser(userId: string): Promise<number>;
}

export class TursoStorage implements IStorage {
  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.googleId, googleId));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'bannedUntil'>): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(schema.users).values({
      id,
      ...userData,
      createdAt: new Date(),
      bannedUntil: null,
    }).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async banUser(id: string, until: Date): Promise<void> {
    await db.update(schema.users).set({ bannedUntil: until }).where(eq(schema.users.id, id));
  }

  // Sessions
  async createSession(userId: string): Promise<Session> {
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const [session] = await db.insert(schema.sessions).values({ id, userId, expiresAt }).returning();
    return session;
  }

  async getSession(id: string): Promise<(Session & { user: User }) | undefined> {
    const [result] = await db
      .select()
      .from(schema.sessions)
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(eq(schema.sessions.id, id));
    
    if (!result) return undefined;
    
    // Check if session is expired
    if (result.sessions.expiresAt < new Date()) {
      await this.deleteSession(id);
      return undefined;
    }
    
    return { ...result.sessions, user: result.users };
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  }

  // Groups
  async getGroupsByUser(userId: string): Promise<Group[]> {
    return db.select().from(schema.groups).where(eq(schema.groups.userId, userId)).orderBy(schema.groups.order);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const [newGroup] = await db.insert(schema.groups).values({ id, ...group }).returning();
    return newGroup;
  }

  async deleteGroup(id: string, userId: string): Promise<void> {
    await db.delete(schema.groups).where(and(eq(schema.groups.id, id), eq(schema.groups.userId, userId)));
  }

  // Links
  async getLinksByUser(userId: string): Promise<Link[]> {
    return db.select().from(schema.links).where(eq(schema.links.userId, userId)).orderBy(schema.links.createdAt);
  }

  async createLink(link: InsertLink): Promise<Link> {
    const id = randomUUID();
    const [newLink] = await db.insert(schema.links).values({ id, ...link, createdAt: new Date() }).returning();
    return newLink;
  }

  async deleteLink(id: string, userId: string): Promise<void> {
    await db.delete(schema.links).where(and(eq(schema.links.id, id), eq(schema.links.userId, userId)));
  }

  async deleteAllLinksByUser(userId: string): Promise<void> {
    await db.delete(schema.links).where(eq(schema.links.userId, userId));
  }

  async countLinksByUser(userId: string): Promise<number> {
    const links = await db.select().from(schema.links).where(eq(schema.links.userId, userId));
    return links.length;
  }
}

export const storage = new TursoStorage();
