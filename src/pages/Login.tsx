import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { googleLoginUrl } from "../lib/api";
import { webpOf } from "../lib/staticImage";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Phiên đăng nhập đã hết hạn, vui lòng thử lại.",
  missing_code: "Đăng nhập Google không thành công, vui lòng thử lại.",
  exchange_failed: "Không xác thực được với Google, vui lòng thử lại.",
  userinfo_failed: "Không lấy được thông tin tài khoản Google.",
  incomplete_profile: "Tài khoản Google thiếu thông tin cần thiết.",
  email_not_allowed: "Tài khoản này không có quyền truy cập hệ thống. Vui lòng liên hệ P.Công Nghệ.",
  email_not_verified: "Email Google của bạn chưa được xác thực.",
  account_disabled: "Tài khoản của bạn đã bị vô hiệu hoá.",
  server_error: "Có lỗi xảy ra, vui lòng thử lại sau.",
};

export default function Login() {
  const [params, setParams] = useSearchParams();
  const errorCode = params.get("error");
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? "Đăng nhập không thành công, vui lòng thử lại.") : "";

  useEffect(() => {
    if (!errorCode) return;
    const next = new URLSearchParams(params);
    next.delete("error");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-login">
      <picture>
        <source srcSet={webpOf("/images/background-logo.png")} type="image/webp" />
        <img className="admin-login-watermark" src="/images/background-logo.png" alt="" aria-hidden />
      </picture>
      <div className="admin-login-scrim" aria-hidden />

      <div className="admin-login-container">
        <header className="admin-login-header">
          <picture>
            <source srcSet={webpOf("/images/logo-2.png")} type="image/webp" />
            <img
              className="admin-login-logo"
              src="/images/logo-2.png"
              alt="Vietnam America Schools — Trường học của sự lắng nghe"
              width={320}
              height={92}
            />
          </picture>
          <p className="admin-login-app-name">Hệ thống đặt phòng EBR</p>
        </header>

        <div className="admin-login-card">
          <h1>Đăng nhập</h1>
          <p>Đăng nhập bằng tài khoản email do nhà trường cung cấp</p>

          {errorMessage && <div className="admin-login-error">{errorMessage}</div>}

          <div className="admin-login-actions">
            <button
              type="button"
              className="admin-login-google-btn"
              aria-label="Đăng nhập bằng Google"
              onClick={() => {
                window.location.href = googleLoginUrl();
              }}
            >
              <img
                className="admin-login-google-icon"
                src="/images/google.png"
                alt=""
                width={40}
                height={40}
                loading="eager"
                decoding="async"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
