import type { Booking, BookingDraft } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export type AdminRole = "staff" | "superadmin";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  role: AdminRole;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchSession(): Promise<{ user: AdminUser | null }> {
  return request("/api/auth/session");
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return request("/api/auth/logout", { method: "POST" });
}

export function googleLoginUrl(): string {
  return `${API_BASE}/auth/google/login`;
}

export function fetchBookings(): Promise<{ bookings: Booking[] }> {
  return request("/api/bookings");
}

export function submitBooking(draft: BookingDraft): Promise<{ booking: Booking }> {
  return request("/api/bookings", { method: "POST", body: JSON.stringify(draft) });
}

export function approveBookingApi(id: string): Promise<{ booking: Booking }> {
  return request(`/api/bookings/${id}/approve`, { method: "POST" });
}

export function rejectBookingApi(id: string, reason: string): Promise<{ booking: Booking }> {
  return request(`/api/bookings/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
