import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ActivityType, BookingDraft, EbrLocation } from "../types";
import { ACTIVITY_TYPES, LOCATIONS } from "../lib/constants";
import { orgFromEmail } from "../lib/format";
import { useAuth } from "../auth/AuthContext";

interface BookingFormProps {
  onSubmit: (draft: BookingDraft) => void;
  onReviewTerms: () => void;
}

interface FormState {
  org: string;
  contact: string;
  phone: string;
  event: string;
  location: EbrLocation;
  type: ActivityType;
  date: string;
  start: string;
  end: string;
  attendees: string;
  note: string;
}

function emptyForm(defaultOrg: string): FormState {
  return {
    org: defaultOrg,
    contact: "",
    phone: "",
    event: "",
    location: "EBR Âu Cơ",
    type: "Họp nội bộ",
    date: "",
    start: "",
    end: "",
    attendees: "",
    note: "",
  };
}

export function BookingForm({ onSubmit, onReviewTerms }: BookingFormProps) {
  const { user } = useAuth();
  const defaultOrg = useMemo(() => orgFromEmail(user?.email ?? ""), [user?.email]);
  const [values, setValues] = useState<FormState>(() => emptyForm(defaultOrg));
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const { org, contact, phone, event, date, attendees, start, end } = values;

    if (!org || !contact || !phone || !event || !date || !attendees || !start || !end) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    if (end <= start) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    onSubmit({
      org,
      contact,
      phone,
      event,
      location: values.location,
      type: values.type,
      date,
      start,
      end,
      attendees: Number(attendees),
      note: values.note,
    });

    setValues(emptyForm(org));
  }

  return (
    <section className="panel-form-wrap">
      <div className="card">
        <p className="lede">
          Điền thông tin để đăng ký sử dụng không gian EBR. Yêu cầu sẽ được gửi tới P.HCNS để phê
          duyệt.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="frow frow-3">
            <div className="field">
              <label htmlFor="f-org">Đơn vị / Phòng ban</label>
              <input
                id="f-org"
                type="text"
                value={values.org}
                onChange={(e) => set("org", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-contact">Người liên hệ</label>
              <input
                id="f-contact"
                type="text"
                value={values.contact}
                onChange={(e) => set("contact", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-phone">Số điện thoại</label>
              <input
                id="f-phone"
                type="tel"
                placeholder="09xx xxx xxx"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-attendees">Số người dự kiến</label>
              <input
                id="f-attendees"
                type="number"
                min={1}
                placeholder="VD: 12"
                value={values.attendees}
                onChange={(e) => set("attendees", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="frow">
            <div className="field">
              <label htmlFor="f-event">Tên sự kiện</label>
              <input
                id="f-event"
                type="text"
                placeholder="VD: Họp giao ban tháng 10"
                value={values.event}
                onChange={(e) => set("event", e.target.value)}
                required
              />
            </div>
            <fieldset>
              <legend>Địa điểm EBR</legend>
              <div className="choice-row">
                {LOCATIONS.map((loc) => (
                  <label key={loc} className={`choice${values.location === loc ? " is-checked" : ""}`}>
                    <input
                      type="radio"
                      name="loc"
                      value={loc}
                      checked={values.location === loc}
                      onChange={() => set("location", loc)}
                    />
                    {loc.replace("EBR ", "")}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset style={{ gridColumn: "span 2" }}>
              <legend>Loại hình hoạt động</legend>
              <div className="choice-row">
                {ACTIVITY_TYPES.map((t) => (
                  <label key={t} className={`choice${values.type === t ? " is-checked" : ""}`}>
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={values.type === t}
                      onChange={() => set("type", t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="frow frow-time">
            <div className="field">
              <label htmlFor="f-date">Ngày sử dụng</label>
              <input
                id="f-date"
                type="date"
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-start">Giờ bắt đầu</label>
              <input
                id="f-start"
                type="time"
                value={values.start}
                onChange={(e) => set("start", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-end">Giờ kết thúc</label>
              <input
                id="f-end"
                type="time"
                value={values.end}
                onChange={(e) => set("end", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-note">Ghi chú (nếu có)</label>
              <input
                id="f-note"
                type="text"
                placeholder="VD: cần máy chiếu..."
                value={values.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </div>
          </div>

          <div className="terms-ack">
            <span>✓ Bạn đã đồng ý Điều khoản sử dụng không gian EBR.</span>
            <button type="button" className="terms-ack-link" onClick={onReviewTerms}>
              Xem lại điều khoản
            </button>
          </div>

          <div className="actions-row">
            <span style={{ color: "var(--ban-linh)", fontWeight: 600, fontSize: "12px" }}>
              {error}
            </span>
            <button type="submit" className="btn btn-primary">
              Gửi yêu cầu đăng ký
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
