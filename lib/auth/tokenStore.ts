// Simple in-memory access token store with subscription support.
// This never persists to storage and resets on reload.

type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  for (const l of listeners) l(accessToken);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearAccessToken() {
  setAccessToken(null);
}
