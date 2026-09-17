import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: required("GOOGLE_REDIRECT_URI", "http://localhost:4000/auth/google/callback"),
  allowedDomains: (process.env.GOOGLE_ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  superadminEmails: (process.env.SUPERADMIN_EMAILS ?? "khoana@hcm.vaschools.edu.vn")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173"),
  frontendLoginPath: process.env.FRONTEND_LOGIN_PATH ?? "/login",
  frontendHomePath: process.env.FRONTEND_HOME_PATH ?? "/",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "va_ebr_session",
  secureCookie: process.env.SECURE_COOKIE === "true",
  sessionTtlMs: 1000 * 60 * 60 * 24 * 7, // 7 ngày
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    database: required("DB_NAME", "va_ebr"),
    user: required("DB_USER", "va_ebr_app"),
    password: required("DB_PASSWORD"),
  },
};

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(config.googleClientId && config.googleClientSecret);
}
