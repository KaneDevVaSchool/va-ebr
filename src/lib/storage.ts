const LAST_TAB_KEY = "ebr_last_tab";
const TERMS_AGREED_KEY = "ebr_terms_agreed_email";

export function loadLastTab(): string | null {
  try {
    return localStorage.getItem(LAST_TAB_KEY);
  } catch {
    return null;
  }
}

export function saveLastTab(tab: string): void {
  try {
    localStorage.setItem(LAST_TAB_KEY, tab);
  } catch {
    // ignore
  }
}

export function hasAgreedTerms(email: string): boolean {
  try {
    return localStorage.getItem(TERMS_AGREED_KEY) === email;
  } catch {
    return false;
  }
}

export function saveAgreedTerms(email: string): void {
  try {
    localStorage.setItem(TERMS_AGREED_KEY, email);
  } catch {
    // ignore
  }
}
