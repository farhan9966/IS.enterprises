import bcrypt from "bcryptjs";
import session from "express-session";
import type { Request, Response, NextFunction } from "express";
import type { PublicUser } from "../shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function toPublicUser(user: { id: number; email: string; name: string; role: string }): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role as "customer" | "admin" };
}

export function sessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.warn(
      "[shoe-store] SESSION_SECRET is not set. Using an insecure default for local development only. Set SESSION_SECRET in your .env before deploying.",
    );
  }
  return session({
    secret: secret || "dev-only-insecure-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
    },
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}
