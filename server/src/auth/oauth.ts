import crypto from "node:crypto";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config.js";

const OAUTH_STATE_COOKIE = "va_ebr_oauth_state";
const OAUTH_STATE_TTL_MS = 5 * 60 * 1000;
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(config.googleClientId && config.googleClientSecret);
}

export function newOAuthClient(): OAuth2Client {
  return new OAuth2Client(config.googleClientId, config.googleClientSecret, config.googleRedirectUri);
}

export function generateState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function setOAuthStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    path: "/",
    maxAge: OAUTH_STATE_TTL_MS,
    httpOnly: true,
    secure: config.secureCookie,
    sameSite: "lax",
  });
}

export function readAndClearOAuthStateCookie(req: Request, res: Response): string | null {
  const value = req.cookies?.[OAUTH_STATE_COOKIE] ?? null;
  res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });
  return value;
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}

export async function exchangeCodeAndFetchProfile(code: string): Promise<GoogleUserInfo> {
  const client = newOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token) {
    throw new Error("No access_token returned by Google");
  }
  const resp = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!resp.ok) {
    throw new Error(`Userinfo endpoint returned ${resp.status}`);
  }
  return (await resp.json()) as GoogleUserInfo;
}
