import type { RowDataPacket } from "mysql2";
import { pool } from "./pool.js";
import type { Booking, BookingDraft, BookingStatus } from "../models.js";

interface BookingRow extends RowDataPacket {
  id: string;
  org: string;
  contact: string;
  phone: string;
  event: string;
  location: string;
  type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  attendees: number;
  note: string | null;
  status: BookingStatus;
  reason: string | null;
  requested_by_email: string;
  created_at: string;
}

function mapRow(row: BookingRow): Booking {
  return {
    id: row.id,
    org: row.org,
    contact: row.contact,
    phone: row.phone,
    event: row.event,
    location: row.location,
    type: row.type,
    date: row.booking_date,
    start: row.start_time,
    end: row.end_time,
    attendees: row.attendees,
    note: row.note ?? "",
    status: row.status,
    reason: row.reason ?? "",
    requestedByEmail: row.requested_by_email,
    createdAt: row.created_at,
  };
}

export async function listBookings(): Promise<Booking[]> {
  const [rows] = await pool.query<BookingRow[]>(
    "SELECT * FROM bookings ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

async function nextBookingId(): Promise<string> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM bookings");
  const n = Number(rows[0]?.n ?? 0);
  return `EBR-${1001 + n}`;
}

export async function createBooking(draft: BookingDraft): Promise<Booking> {
  const id = await nextBookingId();
  await pool.query(
    `INSERT INTO bookings
      (id, org, contact, phone, event, location, type, booking_date, start_time, end_time, attendees, note, requested_by_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      draft.org,
      draft.contact,
      draft.phone,
      draft.event,
      draft.location,
      draft.type,
      draft.date,
      draft.start,
      draft.end,
      draft.attendees,
      draft.note,
      draft.requestedByEmail,
    ],
  );
  const [rows] = await pool.query<BookingRow[]>("SELECT * FROM bookings WHERE id = ?", [id]);
  return mapRow(rows[0]);
}

export async function approveBooking(id: string, adminId: number): Promise<Booking | null> {
  await pool.query(
    "UPDATE bookings SET status = 'approved', reason = '', decided_by_admin_id = ? WHERE id = ?",
    [adminId, id],
  );
  const [rows] = await pool.query<BookingRow[]>("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function rejectBooking(
  id: string,
  reason: string,
  adminId: number,
): Promise<Booking | null> {
  await pool.query(
    "UPDATE bookings SET status = 'rejected', reason = ?, decided_by_admin_id = ? WHERE id = ?",
    [reason, adminId, id],
  );
  const [rows] = await pool.query<BookingRow[]>("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}
