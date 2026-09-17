import type { Request, Response } from "express";
import { config } from "../config.js";

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(config.sessionCookieName, token, {
    path: "/",
    expires: expiresAt,
    httpOnly: true,
    secure: config.secureCookie,
    sameSite: "lax",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.sessionCookieName, { path: "/" });
}

export function readSessionCookie(req: Request): string {
  return req.cookies?.[config.sessionCookieName] ?? "";
}
