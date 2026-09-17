import { useState } from "react";
import { TERMS_TEXT } from "../lib/constants";

interface TermsModalProps {
  open: boolean;
  /** Khi false, đây là chế độ "xem lại" — không bắt buộc tích chọn, chỉ có nút Đóng. */
  requireAgreement: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export function TermsModal({ open, requireAgreement, onAgree, onClose }: TermsModalProps) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="terms-modal-backdrop">
      <div
        className="terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="termsTitle"
      >
        <h3 id="termsTitle">Điều khoản sử dụng không gian EBR</h3>
        <div className="terms-modal-body">{TERMS_TEXT}</div>

        {requireAgreement ? (
          <>
            <label className="terms-modal-agree">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span>Tôi đã đọc và đồng ý với Điều khoản sử dụng không gian EBR. (Bắt buộc)</span>
            </label>
            <div className="terms-modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!checked}
                onClick={onAgree}
              >
                Đồng ý &amp; tiếp tục
              </button>
            </div>
          </>
        ) : (
          <div className="terms-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
