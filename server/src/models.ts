export type AdminRole = "staff" | "superadmin";

export interface AdminUser {
  id: number;
  googleSub: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  adminUserId: number;
  expiresAt: string;
  createdAt: string;
}

export type BookingStatus = "pending" | "approved" | "rejected";

export interface Booking {
  id: string;
  org: string;
  contact: string;
  phone: string;
  event: string;
  location: string;
  type: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  note: string;
  status: BookingStatus;
  reason: string;
  requestedByEmail: string;
  createdAt: string;
}

export type BookingDraft = Omit<Booking, "id" | "status" | "reason" | "createdAt">;
