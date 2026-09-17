import { Fragment } from "react";
import type { Booking } from "../types";
import { dayNameOf, formatDate } from "../lib/format";

interface CalendarPanelProps {
  bookings: Booking[];
}

export function CalendarPanel({ bookings }: CalendarPanelProps) {
  const approved = bookings
    .filter((b) => b.status === "approved")
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.start < b.start ? -1 : 1));

  let lastDate: string | null = null;

  return (
    <section>
      <div className="section-head">
        <h2>Lịch chung EBR</h2>
        <span className="count-pill">{approved.length} sự kiện đã duyệt</span>
      </div>
      <div className="scroll-area">
        <div className="cal-list">
          {approved.length === 0 && <div className="empty">Chưa có sự kiện nào được duyệt.</div>}
          {approved.map((b) => {
            const showDay = b.date !== lastDate;
            lastDate = b.date;
            return (
              <Fragment key={b.id}>
                {showDay && (
                  <div className="cal-day">
                    {dayNameOf(b.date)} · {formatDate(b.date)}
                  </div>
                )}
                <div className="cal-item">
                  <div className="cal-time">
                    {b.start}–{b.end}
                  </div>
                  <div className="cal-loc">{b.location.replace("EBR ", "")}</div>
                  <div className="cal-info">
                    <b>{b.event}</b>
                    <span>
                      {b.org} · {b.attendees} người
                    </span>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
