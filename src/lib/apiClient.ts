import { PlanLimitError } from './entitlements';
import { getStoredAuth, setStoredAuth } from './authStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  error?: string;

  constructor(message: string, status: number, code?: string, error?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.error = error;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
};

function parseErrorField(error: unknown): string | undefined {
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object') {
    const record = error as { message?: string };
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }
    try {
      return JSON.stringify(error);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function parseErrorsField(errors: unknown): string | undefined {
  if (!errors) return undefined;
  if (typeof errors === 'string' && errors.trim()) return errors.trim();

  if (Array.isArray(errors)) {
    const lines = errors.flatMap((item) => {
      if (typeof item === 'string' && item.trim()) return [item.trim()];
      if (item && typeof item === 'object') {
        const msg = (item as { message?: string }).message;
        if (typeof msg === 'string' && msg.trim()) return [msg.trim()];
      }
      return [];
    });
    return lines.length ? lines.join('\n') : undefined;
  }

  if (typeof errors === 'object') {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(errors)) {
      if (typeof value === 'string' && value.trim()) {
        lines.push(`${key}: ${value.trim()}`);
      } else if (Array.isArray(value)) {
        const joined = value
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .join(', ');
        if (joined) lines.push(`${key}: ${joined}`);
      }
    }
    return lines.length ? lines.join('\n') : undefined;
  }

  return undefined;
}

function combineErrorDetails(...parts: (string | undefined)[]): string | undefined {
  const unique = [...new Set(parts.map((part) => part?.trim()).filter(Boolean) as string[])];
  return unique.length ? unique.join('\n\n') : undefined;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Request failed';
  let code: string | undefined;
  let errorDetail: string | undefined;
  try {
    const data = (await res.json()) as {
      message?: string;
      error?: unknown;
      errors?: unknown;
      code?: string;
    };
    code = data.code;
    errorDetail = combineErrorDetails(
      parseErrorField(data.error),
      parseErrorsField(data.errors)
    );
    if (data.message) {
      message = data.message;
    } else if (errorDetail) {
      message = errorDetail;
      errorDetail = undefined;
    }
  } catch {
    // ignore
  }
  return new ApiError(message, res.status, code, errorDetail);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getStoredAuth()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && auth) {
    setStoredAuth(null);
  }

  if (!res.ok) {
    const err = await parseError(res);
    if (err.code === 'PLAN_LIMIT') {
      throw new PlanLimitError(err.message);
    }
    throw err;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export { API_BASE };
