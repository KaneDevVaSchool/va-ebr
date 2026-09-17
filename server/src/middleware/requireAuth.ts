import type { NextFunction, Request, Response } from "express";
import { readSessionCookie } from "../auth/session-cookie.js";
import { validateSession } from "../db/sessions.js";
import type { AdminUser } from "../models.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readSessionCookie(req);
  const result = await validateSession(token);
  if (!result) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Chưa đăng nhập" });
    return;
  }
  req.adminUser = result.user;
  next();
}
