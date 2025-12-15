import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export function getGoogleAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  const tokens = await tokenRes.json();
  
  // Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error("Failed to get user info");
  }

  return userRes.json();
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.session;
  
  if (!sessionId) {
    (req as any).user = null;
    return next();
  }

  const session = await storage.getSession(sessionId);
  
  if (!session) {
    res.clearCookie("session");
    (req as any).user = null;
    return next();
  }

  // Check if user is banned
  if (session.user.bannedUntil && session.user.bannedUntil > new Date()) {
    res.clearCookie("session");
    (req as any).user = null;
    return next();
  }

  (req as any).user = session.user;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
