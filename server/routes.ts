import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertGroupSchema, insertLinkSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getGoogleAuthUrl, exchangeGoogleCode, authMiddleware, requireAuth } from "./auth";
import cookieParser from "cookie-parser";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(cookieParser());
  app.use(authMiddleware);

  // Auth routes
  app.get("/api/auth/google", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    res.json({ url: getGoogleAuthUrl(redirectUri) });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.redirect("/?error=no_code");
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
      
      const googleUser = await exchangeGoogleCode(code, redirectUri);
      
      // Check if user exists
      let user = await storage.getUserByGoogleId(googleUser.id);
      
      if (!user) {
        // Check if email is banned
        const existingUser = await storage.getUserByEmail(googleUser.email);
        if (existingUser?.bannedUntil && existingUser.bannedUntil > new Date()) {
          const daysLeft = Math.ceil((existingUser.bannedUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return res.redirect(`/?error=banned&days=${daysLeft}`);
        }
        
        // Create new user
        user = await storage.createUser({
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        });

        // Create default groups for new user
        const defaultGroups = [
          { name: "Design Inspiration", order: 1, userId: user.id },
          { name: "Development", order: 2, userId: user.id },
          { name: "To Read", order: 3, userId: user.id },
          { name: "Tools", order: 4, userId: user.id },
        ];
        
        for (const group of defaultGroups) {
          await storage.createGroup(group);
        }
      }

      // Create session
      const session = await storage.createSession(user.id);
      
      res.cookie("session", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.redirect("/");
    } catch (error) {
      console.error("Google auth error:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.json({ user: null });
    }
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies?.session;
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    res.clearCookie("session");
    res.json({ success: true });
  });

  // Account routes
  app.get("/api/account/stats", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const linkCount = await storage.countLinksByUser(user.id);
      res.json({
        linkCount,
        joinedAt: user.createdAt,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/account/delete-all-links", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { confirmation } = req.body;
      
      if (confirmation !== "DELETE ALL MY LINKS") {
        return res.status(400).json({ error: "Invalid confirmation" });
      }

      await storage.deleteAllLinksByUser(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting links:", error);
      res.status(500).json({ error: "Failed to delete links" });
    }
  });

  app.post("/api/account/delete", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { confirmation } = req.body;
      
      if (confirmation !== "DELETE MY ACCOUNT") {
        return res.status(400).json({ error: "Invalid confirmation" });
      }

      // Ban the email for 4 days before deleting
      const banUntil = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      await storage.banUser(user.id, banUntil);
      
      // Clear session
      const sessionId = req.cookies?.session;
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }
      res.clearCookie("session");

      // Delete user and all their data (cascade)
      await storage.deleteUser(user.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Groups
  app.get("/api/groups", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const groups = await storage.getGroupsByUser(user.id);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const parsed = insertGroupSchema.safeParse({ ...req.body, userId: user.id });
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).toString() });
      }
      const group = await storage.createGroup(parsed.data);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.delete("/api/groups/:id", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      await storage.deleteGroup(req.params.id, user.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  // Links
  app.get("/api/links", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const links = await storage.getLinksByUser(user.id);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.post("/api/links", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const parsed = insertLinkSchema.safeParse({ ...req.body, userId: user.id });
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).toString() });
      }
      const link = await storage.createLink(parsed.data);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  app.delete("/api/links/:id", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      await storage.deleteLink(req.params.id, user.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  return httpServer;
}
