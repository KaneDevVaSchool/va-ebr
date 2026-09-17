export type BookingStatus = "pending" | "approved" | "rejected";

export type EbrLocation = "EBR Âu Cơ" | "EBR Lạc Long Quân";

export type ActivityType = "Họp nội bộ" | "Sinh nhật" | "Gặp đối tác" | "Khác";

export interface Booking {
  id: string;
  org: string;
  contact: string;
  phone: string;
  event: string;
  location: EbrLocation;
  type: ActivityType;
  date: string; // ISO yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  attendees: number;
  note: string;
  status: BookingStatus;
  reason: string;
  createdAt: string;
}

export type BookingDraft = Omit<Booking, "id" | "status" | "reason" | "createdAt">;

export type TabId = "form" | "approve" | "calendar";
