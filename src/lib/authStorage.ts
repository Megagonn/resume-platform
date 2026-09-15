import type { User } from '../types';

const AUTH_KEY = 'ready-brand-auth';

export function getStoredAuth(): { token: string; user: User } | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; user: User };
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: { token: string; user: User } | null) {
  if (!auth) localStorage.removeItem(AUTH_KEY);
  else localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}
