import { useCallback, useEffect, useState } from "react";
import type { Booking, BookingDraft } from "../types";
import { approveBookingApi, fetchBookings, rejectBookingApi, submitBooking } from "../lib/api";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { bookings: list } = await fetchBookings();
      setBookings(list);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addBooking(draft: BookingDraft): Promise<Booking> {
    const { booking } = await submitBooking(draft);
    setBookings((list) => [booking, ...list]);
    return booking;
  }

  async function approveBooking(id: string): Promise<Booking> {
    const { booking } = await approveBookingApi(id);
    setBookings((list) => list.map((b) => (b.id === id ? booking : b)));
    return booking;
  }

  async function rejectBooking(id: string, reason: string): Promise<Booking> {
    const { booking } = await rejectBookingApi(id, reason);
    setBookings((list) => list.map((b) => (b.id === id ? booking : b)));
    return booking;
  }

  return { bookings, loading, error, addBooking, approveBooking, rejectBooking, reload };
}
