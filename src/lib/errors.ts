import { ApiError } from './apiClient';

export function formatErrorDetails(message?: string, error?: string): string {
  const msg = message?.trim();
  const detail = error?.trim();
  if (msg && detail && msg !== detail) return `${msg}\n\n${detail}`;
  return msg || detail || '';
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof ApiError) {
    const formatted = formatErrorDetails(err.message, err.error);
    if (formatted) return formatted;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}
