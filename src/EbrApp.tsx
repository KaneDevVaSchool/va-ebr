import { useEffect, useState } from "react";
import type { TabId } from "./types";
import { useAuth } from "./auth/AuthContext";
import { useBookings } from "./hooks/useBookings";
import { useToast } from "./hooks/useToast";
import { hasAgreedTerms, loadLastTab, saveAgreedTerms, saveLastTab } from "./lib/storage";
import { TABS } from "./lib/constants";
import { webpOf } from "./lib/staticImage";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toast } from "./components/Toast";
import { BookingForm } from "./components/BookingForm";
import { ApprovePanel } from "./components/ApprovePanel";
import { CalendarPanel } from "./components/CalendarPanel";
import { RejectModal } from "./components/RejectModal";
import { TermsModal } from "./components/TermsModal";

export function EbrApp() {
  const { user, viewAsRole } = useAuth();
  const { bookings, loading, error, addBooking, approveBooking, rejectBooking } = useBookings();
  const { message, showToast } = useToast();
  const [tab, setTab] = useState<TabId>(() => (loadLastTab() as TabId) || "form");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [reviewingTerms, setReviewingTerms] = useState(false);

  useEffect(() => saveLastTab(tab), [tab]);

  useEffect(() => {
    if (user?.email) setTermsAgreed(hasAgreedTerms(user.email));
  }, [user?.email]);

  function handleAgreeTerms() {
    if (user?.email) saveAgreedTerms(user.email);
    setTermsAgreed(true);
  }

  const effectiveRole = viewAsRole ?? user?.role;
  useEffect(() => {
    const allowed = TABS.find((t) => t.id === tab)?.roles.includes(effectiveRole ?? "staff");
    if (!allowed) setTab("form");
  }, [tab, effectiveRole]);

  async function handleSubmit(draft: Parameters<typeof addBooking>[0]) {
    try {
      const record = await addBooking(draft);
      showToast(`Đã gửi yêu cầu ${record.id} tới P.HCNS để phê duyệt.`);
      setTab("approve");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gửi yêu cầu thất bại, vui lòng thử lại.");
    }
  }

  async function handleApprove(id: string) {
    try {
      const b = await approveBooking(id);
      showToast(`Đã duyệt ${id}. Sự kiện đồng bộ lên Lịch chung, email xác nhận đã gửi tới ${b.org}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Duyệt yêu cầu thất bại.");
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectingId) return;
    try {
      await rejectBooking(rejectingId, reason);
      showToast(`Đã từ chối ${rejectingId}. Email kèm lý do đã gửi tới đơn vị đăng ký.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Từ chối yêu cầu thất bại.");
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <div className="app-bg">
      <picture>
        <source srcSet={webpOf("/images/background-logo.png")} type="image/webp" />
        <img className="app-bg-watermark" src="/images/background-logo.png" alt="" aria-hidden />
      </picture>
      <div className="shell">
        <Header activeTab={tab} onChangeTab={setTab} />

        <main>
          {error && <div className="banner-error">{error}</div>}
          {loading ? (
            <div className="auth-loading">
              <span>Đang tải dữ liệu…</span>
            </div>
          ) : (
            <>
              {tab === "form" && (
                <BookingForm onSubmit={handleSubmit} onReviewTerms={() => setReviewingTerms(true)} />
              )}
              {tab === "approve" && (
                <ApprovePanel bookings={bookings} onApprove={handleApprove} onReject={setRejectingId} />
              )}
              {tab === "calendar" && <CalendarPanel bookings={bookings} />}
            </>
          )}
        </main>

        <Footer />
        <Toast message={message} />
        <RejectModal
          open={!!rejectingId}
          onCancel={() => setRejectingId(null)}
          onConfirm={handleRejectConfirm}
        />
        <TermsModal
          open={!loading && !!user && (!termsAgreed || reviewingTerms)}
          requireAgreement={!termsAgreed}
          onAgree={handleAgreeTerms}
          onClose={() => setReviewingTerms(false)}
        />
      </div>
    </div>
  );
}
