import { useEffect, useRef, useState } from "react";

interface RejectModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectModal({ open, onCancel, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setErr("");
      const id = setTimeout(() => textareaRef.current?.focus(), 30);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;

  function confirm() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setErr("Vui lòng nhập lý do từ chối trước khi gửi.");
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rejectTitle">
        <h3 id="rejectTitle">Lý do từ chối</h3>
        <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", margin: 0 }}>
          Lý do sẽ được gửi qua email tới đơn vị đăng ký.
        </p>
        <textarea
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="VD: Trùng lịch sử dụng với đơn vị khác vào khung giờ này."
        />
        <div className="err">{err}</div>
        <div className="row">
          <button className="btn btn-ghost" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn btn-reject" onClick={confirm}>
            Gửi từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
