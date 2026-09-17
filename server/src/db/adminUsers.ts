import type { RowDataPacket } from "mysql2";
import { pool } from "./pool.js";
import type { AdminRole, AdminUser } from "../models.js";

interface AdminUserRow extends RowDataPacket {
  id: number;
  google_sub: string;
  email: string;
  name: string;
  avatar_url: string;
  role: AdminRole;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
}

function mapRow(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    googleSub: row.google_sub,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isActive: row.is_active === 1,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

export async function findByGoogleSub(googleSub: string): Promise<AdminUser | null> {
  const [rows] = await pool.query<AdminUserRow[]>(
    "SELECT * FROM admin_users WHERE google_sub = ? LIMIT 1",
    [googleSub],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function findById(id: number): Promise<AdminUser | null> {
  const [rows] = await pool.query<AdminUserRow[]>(
    "SELECT * FROM admin_users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createAdminUser(input: {
  googleSub: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: AdminRole;
}): Promise<AdminUser> {
  await pool.query(
    "INSERT INTO admin_users (google_sub, email, name, avatar_url, role) VALUES (?, ?, ?, ?, ?)",
    [input.googleSub, input.email, input.name, input.avatarUrl, input.role],
  );
  const user = await findByGoogleSub(input.googleSub);
  if (!user) throw new Error("Failed to create admin user");
  return user;
}

export async function updateLastLogin(id: number): Promise<void> {
  await pool.query("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [id]);
}

export async function refreshProfileOnLogin(
  id: number,
  input: { name: string; avatarUrl: string; role: AdminRole },
): Promise<void> {
  await pool.query(
    "UPDATE admin_users SET name = ?, avatar_url = ?, role = ?, last_login_at = NOW() WHERE id = ?",
    [input.name, input.avatarUrl, input.role, id],
  );
}
