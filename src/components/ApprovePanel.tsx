import type { Booking } from "../types";
import { StatCard } from "./StatCard";
import { RequestCard } from "./RequestCard";

interface ApprovePanelProps {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const STATUS_RANK: Record<Booking["status"], number> = { pending: 0, approved: 1, rejected: 2 };

export function ApprovePanel({ bookings, onApprove, onReject }: ApprovePanelProps) {
  const pending = bookings.filter((b) => b.status === "pending").length;
  const approved = bookings.filter((b) => b.status === "approved").length;
  const rejected = bookings.filter((b) => b.status === "rejected").length;

  const sorted = [...bookings].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0),
  );

  return (
    <section>
      <div className="stat-row">
        <StatCard label="Tổng yêu cầu" value={bookings.length} />
        <StatCard label="Chờ duyệt" value={pending} tone="pending" />
        <StatCard label="Đã duyệt" value={approved} tone="approved" />
        <StatCard label="Từ chối" value={rejected} tone="rejected" />
      </div>
      <div className="section-head">
        <h2>Danh sách yêu cầu</h2>
        <span className="count-pill">{pending} chờ duyệt</span>
      </div>
      <div className="scroll-area">
        <div className="req-list">
          {sorted.length === 0 ? (
            <div className="empty">Chưa có yêu cầu nào.</div>
          ) : (
            sorted.map((b) => (
              <RequestCard key={b.id} booking={b} onApprove={onApprove} onReject={onReject} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
