import { PlanLimitError } from './entitlements';
import { getStoredAuth, setStoredAuth } from './authStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
};

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Request failed';
  let code: string | undefined;
  try {
    const data = (await res.json()) as { message?: string; code?: string };
    if (data.message) message = data.message;
    code = data.code;
  } catch {
    // ignore
  }
  return new ApiError(message, res.status, code);
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
