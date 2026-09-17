import crypto from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "./pool.js";
import { config } from "../config.js";
import type { AdminUser } from "../models.js";
import { findById } from "./adminUsers.js";

interface SessionRow extends RowDataPacket {
  id: string;
  admin_user_id: number;
  expires_at: string;
}

export async function createSession(adminUserId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + config.sessionTtlMs);
  await pool.query("INSERT INTO admin_sessions (id, admin_user_id, expires_at) VALUES (?, ?, ?)", [
    token,
    adminUserId,
    expiresAt,
  ]);
  return { token, expiresAt };
}

export async function validateSession(
  token: string,
): Promise<{ user: AdminUser } | null> {
  if (!token) return null;
  const [rows] = await pool.query<SessionRow[]>(
    "SELECT * FROM admin_sessions WHERE id = ? LIMIT 1",
    [token],
  );
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await deleteSession(token);
    return null;
  }
  const user = await findById(session.admin_user_id);
  if (!user || !user.isActive) return null;
  return { user };
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await pool.query("DELETE FROM admin_sessions WHERE id = ?", [token]);
}
