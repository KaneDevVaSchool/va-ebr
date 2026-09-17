import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { approveBooking, createBooking, listBookings, rejectBooking } from "../db/bookings.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.get("/api/bookings", async (_req, res) => {
  const bookings = await listBookings();
  res.json({ bookings });
});

bookingsRouter.post("/api/bookings", async (req, res) => {
  const b = req.body ?? {};
  const required = ["org", "contact", "phone", "event", "location", "type", "date", "start", "end", "attendees"];
  for (const field of required) {
    if (b[field] === undefined || b[field] === "") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: `Thiếu trường bắt buộc: ${field}` });
      return;
    }
  }
  if (b.end <= b.start) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "Giờ kết thúc phải sau giờ bắt đầu." });
    return;
  }

  const booking = await createBooking({
    org: String(b.org),
    contact: String(b.contact),
    phone: String(b.phone),
    event: String(b.event),
    location: String(b.location),
    type: String(b.type),
    date: String(b.date),
    start: String(b.start),
    end: String(b.end),
    attendees: Number(b.attendees),
    note: String(b.note ?? ""),
    requestedByEmail: req.adminUser!.email,
  });
  res.status(201).json({ booking });
});

bookingsRouter.post("/api/bookings/:id/approve", async (req, res) => {
  const booking = await approveBooking(req.params.id, req.adminUser!.id);
  if (!booking) {
    res.status(404).json({ error: "NOT_FOUND", message: "Không tìm thấy yêu cầu." });
    return;
  }
  res.json({ booking });
});

bookingsRouter.post("/api/bookings/:id/reject", async (req, res) => {
  const reason = String(req.body?.reason ?? "").trim();
  if (!reason) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "Vui lòng nhập lý do từ chối." });
    return;
  }
  const booking = await rejectBooking(req.params.id, reason, req.adminUser!.id);
  if (!booking) {
    res.status(404).json({ error: "NOT_FOUND", message: "Không tìm thấy yêu cầu." });
    return;
  }
  res.json({ booking });
});
