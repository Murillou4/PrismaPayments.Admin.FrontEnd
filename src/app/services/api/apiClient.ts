import {
  createNetworkApiResponse,
  parseApiResponse,
  type ApiResponse
} from './apiResponse';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
}

const INTERNAL_BACKEND_BASE = '/api/internal/backend';
const DEFAULT_TIMEOUT_MS = 25_000;

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${INTERNAL_BACKEND_BASE}${normalizePath(path)}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return `${url.pathname}${url.search}`;
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body;
  }

  headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers({ Accept: 'application/json' });
  const body = method === 'GET' || method === 'DELETE'
    ? undefined
    : serializeBody(options.body, headers);

  try {
    const response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body,
      credentials: 'same-origin',
      signal: controller.signal
    });

    const parsed = parseApiResponse<T>(await readJson(response), response.status);
    if (parsed.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }

    return parsed;
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError';
    return createNetworkApiResponse<T>(
      isAbort
        ? 'O servidor demorou demais para responder. Tente novamente.'
        : 'Falha de rede. Verifique sua conexao.'
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <T>(path: string, params?: RequestOptions['params']) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T>(path: string, params?: RequestOptions['params']) =>
    request<T>(path, { method: 'DELETE', params }),

  postPublic: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  request
};
