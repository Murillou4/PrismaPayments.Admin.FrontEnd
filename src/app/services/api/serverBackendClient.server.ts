import type { RequestEvent } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { clearAuthCookies, getAuthSession, refreshAdminSession } from '$appmod/services/auth/authSession.server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);
const STRIPPED_RESPONSE_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  'content-encoding',
  'content-length',
  'set-cookie'
]);

function getPrivateEnv(name: string): string {
  const runtime = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name] ?? privateEnv[name] ?? '';
}

function normalizeBackendPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function buildBackendUrl(path: string, search: string): string | null {
  const baseUrl = getPrivateEnv('PRIVATE_API_BASE_URL');
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, '')}${normalizeBackendPath(path)}${search}`;
}

function jsonRouteResponse(status: number, message: string): Response {
  return Response.json(
    {
      responseType: status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR',
      message,
      title: status === 401 ? 'Sessao expirada' : 'Erro de infraestrutura',
      status,
      data: null,
      extendedResultCode: status === 401 ? 'UNAUTHORIZED' : 'BACKEND_PROXY_ERROR',
      date: new Date().toISOString()
    },
    { status }
  );
}

function createForwardHeaders(event: RequestEvent, accessToken: string | null, hasBody: boolean): Headers {
  const headers = new Headers();
  const accept = event.request.headers.get('accept');
  const contentType = event.request.headers.get('content-type');

  if (accept) headers.set('accept', accept);
  headers.set('accept-encoding', 'identity');
  if (hasBody && contentType) headers.set('content-type', contentType);
  const clientSecret = getPrivateEnv('PRIVATE_CLIENT_SECRET');
  if (clientSecret) {
    headers.set('client-secret', clientSecret);
  }
  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  const forwardedFor = event.getClientAddress();
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

  return headers;
}

async function readBody(event: RequestEvent): Promise<ArrayBuffer | undefined> {
  if (event.request.method === 'GET' || event.request.method === 'HEAD') {
    return undefined;
  }

  const body = await event.request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

async function forward(
  event: RequestEvent,
  backendPath: string,
  body: ArrayBuffer | undefined,
  accessToken: string | null
): Promise<Response> {
  const backendUrl = buildBackendUrl(backendPath, event.url.search);
  if (!backendUrl) {
    return jsonRouteResponse(500, 'PRIVATE_API_BASE_URL nao esta configurada.');
  }

  const response = await fetch(backendUrl, {
    method: event.request.method,
    headers: createForwardHeaders(event, accessToken, Boolean(body)),
    body
  });

  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function proxyBackendRequest(event: RequestEvent, backendPath: string): Promise<Response> {
  const body = await readBody(event);
  const session = getAuthSession(event.cookies);
  let accessToken = session.accessToken;

  if (!accessToken) {
    const refreshed = session.refreshToken
      ? await refreshAdminSession(event.cookies)
      : null;

    accessToken = refreshed?.accessToken ?? null;
    if (!accessToken) {
      clearAuthCookies(event.cookies);
      return jsonRouteResponse(401, 'Sessao expirada. Faca login novamente.');
    }
  }

  let response: Response;
  try {
    response = await forward(event, backendPath, body, accessToken);
  } catch {
    return jsonRouteResponse(503, 'Falha ao conectar com o backend.');
  }

  if (response.status !== 401 || normalizeBackendPath(backendPath) === '/api/v1/auth/admin/refresh') {
    return response;
  }

  const refreshed = await refreshAdminSession(event.cookies);
  if (!refreshed?.accessToken) {
    clearAuthCookies(event.cookies);
    return response;
  }

  try {
    return await forward(event, backendPath, body, refreshed.accessToken);
  } catch {
    return jsonRouteResponse(503, 'Falha ao conectar com o backend.');
  }
}
