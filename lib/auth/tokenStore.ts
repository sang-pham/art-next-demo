// Access token store with sessionStorage persistence and subscription support.
// - Persists accessToken in sessionStorage so it survives reloads (per-tab).
// - Safe no-ops on the server.

type Listener = (token: string | null) => void;

const STORAGE_KEY = "accessToken";
let accessToken: string | null = null;
let initialized = false;
const listeners = new Set<Listener>();

function canUseSession(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

function readFromSession(): string | null {
  if (!canUseSession()) return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v ? v : null;
  } catch {
    return null;
  }
}

function writeToSession(token: string | null) {
  if (!canUseSession()) return;
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore quota or privacy errors
  }
}

function ensureInit() {
  if (initialized) return;
  initialized = true;
  const fromSession = readFromSession();
  if (fromSession) {
    accessToken = fromSession;
  }
}

export function getAccessToken(): string | null {
  ensureInit();
  return accessToken;
}

export function setAccessToken(token: string | null) {
  ensureInit();
  accessToken = token;
  writeToSession(token);
  for (const l of listeners) l(accessToken);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearAccessToken() {
  setAccessToken(null);
}

// Convenience check to see if there is an access token persisted this session.
export function hasAccessTokenInSession(): boolean {
  return !!readFromSession();
}
