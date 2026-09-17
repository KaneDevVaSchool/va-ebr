import { config } from "../config.js";

export function isEmailAllowed(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  if (config.allowedDomains.length === 0) return true;
  return config.allowedDomains.some((domain) => normalized.endsWith(`@${domain}`));
}

export function isSuperadminEmail(email: string): boolean {
  return config.superadminEmails.includes(email.toLowerCase().trim());
}
