import { Router } from "express";
import { config } from "../config.js";
import {
  buildGoogleAuthUrl,
  exchangeCodeAndFetchProfile,
  generateState,
  isGoogleOAuthConfigured,
  readAndClearOAuthStateCookie,
  setOAuthStateCookie,
} from "../auth/oauth.js";
import { clearSessionCookie, readSessionCookie, setSessionCookie } from "../auth/session-cookie.js";
import { isEmailAllowed, isSuperadminEmail } from "../auth/allowlist.js";
import { createAdminUser, findByGoogleSub, refreshProfileOnLogin } from "../db/adminUsers.js";
import { createSession, deleteSession, validateSession } from "../db/sessions.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

function redirectLoginWithError(res: import("express").Response, reason: string) {
  const url = new URL(config.frontendLoginPath, config.frontendUrl);
  url.searchParams.set("error", reason);
  res.redirect(url.toString());
}

authRouter.get("/auth/google/login", (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    res.status(503).json({
      error: "OAUTH_NOT_CONFIGURED",
      message: "Đăng nhập Google chưa được cấu hình trên máy chủ.",
    });
    return;
  }
  const state = generateState();
  setOAuthStateCookie(res, state);
  res.redirect(buildGoogleAuthUrl(state));
});

authRouter.get("/auth/google/callback", async (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    redirectLoginWithError(res, "server_error");
    return;
  }

  const expectedState = readAndClearOAuthStateCookie(req, res);
  const state = typeof req.query.state === "string" ? req.query.state : "";
  if (!expectedState || !state || state !== expectedState) {
    redirectLoginWithError(res, "invalid_state");
    return;
  }

  if (typeof req.query.error === "string" && req.query.error) {
    redirectLoginWithError(res, req.query.error);
    return;
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  if (!code) {
    redirectLoginWithError(res, "missing_code");
    return;
  }

  try {
    const info = await exchangeCodeAndFetchProfile(code);

    if (!info.sub || !info.email) {
      redirectLoginWithError(res, "incomplete_profile");
      return;
    }
    if (!info.email_verified) {
      redirectLoginWithError(res, "email_not_verified");
      return;
    }
    if (!isEmailAllowed(info.email)) {
      redirectLoginWithError(res, "email_not_allowed");
      return;
    }

    const role = isSuperadminEmail(info.email) ? "superadmin" : "staff";

    let user = await findByGoogleSub(info.sub);
    if (!user) {
      user = await createAdminUser({
        googleSub: info.sub,
        email: info.email,
        name: info.name ?? "",
        avatarUrl: info.picture ?? "",
        role,
      });
    } else {
      if (!user.isActive) {
        redirectLoginWithError(res, "account_disabled");
        return;
      }
      // Làm mới avatar/tên/role mỗi lần đăng nhập vì URL ảnh đại diện của Google
      // (lh3.googleusercontent.com) có thể hết hạn nếu chỉ lưu một lần lúc tạo tài khoản.
      await refreshProfileOnLogin(user.id, {
        name: info.name ?? user.name,
        avatarUrl: info.picture ?? user.avatarUrl,
        role,
      });
      user = await findByGoogleSub(info.sub);
      if (!user) throw new Error("Admin user disappeared after refresh");
    }

    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(res, token, expiresAt);
    res.redirect(new URL(config.frontendHomePath, config.frontendUrl).toString());
  } catch (err) {
    console.error("[auth] Google callback failed:", err);
    redirectLoginWithError(res, "server_error");
  }
});

authRouter.post("/api/auth/logout", async (req, res) => {
  const token = readSessionCookie(req);
  await deleteSession(token);
  clearSessionCookie(res);
  res.json({ loggedOut: true });
});

authRouter.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.adminUser });
});

// Cho phép check trạng thái đăng nhập không cần requireAuth trả 401 ồn ào —
// FE dùng cái này để quyết định hiển thị trang login hay app.
authRouter.get("/api/auth/session", async (req, res) => {
  const token = readSessionCookie(req);
  const result = await validateSession(token);
  res.json({ user: result?.user ?? null });
});
