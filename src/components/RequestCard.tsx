import type { Booking } from "../types";
import { STATUS_LABEL } from "../lib/constants";
import { formatDate } from "../lib/format";

interface RequestCardProps {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestCard({ booking: b, onApprove, onReject }: RequestCardProps) {
  return (
    <div className="req">
      <div className="req-top">
        <div>
          <div className="req-title">{b.event}</div>
          <div className="req-org">
            {b.org} · {b.id}
          </div>
        </div>
        <span className={`badge ${b.status}`}>{STATUS_LABEL[b.status]}</span>
      </div>
      <div className="req-meta">
        <div>
          <b>Địa điểm</b>
          {b.location}
        </div>
        <div>
          <b>Loại hình</b>
          {b.type}
        </div>
        <div>
          <b>Ngày</b>
          {formatDate(b.date)}
        </div>
        <div>
          <b>Giờ</b>
          {b.start} – {b.end}
        </div>
        <div>
          <b>Số người</b>
          {b.attendees}
        </div>
        <div>
          <b>Liên hệ</b>
          {b.contact} · {b.phone}
        </div>
      </div>
      {b.note && <div className="req-note">Ghi chú: {b.note}</div>}
      {b.status === "rejected" && b.reason && (
        <div className="req-reason">Lý do từ chối: {b.reason}</div>
      )}
      {b.status === "pending" && (
        <div className="req-foot">
          <button className="btn btn-reject btn-sm" onClick={() => onReject(b.id)}>
            Từ chối
          </button>
          <button className="btn btn-approve btn-sm" onClick={() => onApprove(b.id)}>
            Phê duyệt
          </button>
        </div>
      )}
    </div>
  );
}
