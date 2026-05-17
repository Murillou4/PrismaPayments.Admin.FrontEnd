import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { proxyBackendRequest } from '../serverBackendClient.server';

function createCookieJar(initial: Record<string, string> = {}): Cookies {
  const jar = new Map(Object.entries(initial));
  return {
    get: (name: string) => jar.get(name),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name)
  } as unknown as Cookies;
}

function createEvent(cookies: Cookies, method = 'GET'): RequestEvent {
  const url = new URL('https://admin.test/api/internal/backend/api/v1/admin/merchants?limit=10');
  return {
    cookies,
    request: new Request(url, {
      method,
      headers: {
        accept: 'application/json'
      }
    }),
    url,
    getClientAddress: () => '127.0.0.1'
  } as unknown as RequestEvent;
}

function routeMessage(status: number, data: unknown = null): Response {
  return Response.json(
    {
      responseType: status >= 200 && status < 300 ? 'OK' : 'UNAUTHORIZED',
      message: status >= 200 && status < 300 ? 'ok' : 'expired',
      title: status >= 200 && status < 300 ? 'OK' : 'Unauthorized',
      status,
      data,
      extendedResultCode: status >= 200 && status < 300 ? 'OK' : 'UNAUTHORIZED',
      date: new Date().toISOString()
    },
    { status }
  );
}

describe('server backend proxy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('PRIVATE_API_BASE_URL', 'https://backend.test');
    vi.stubEnv('PRIVATE_CLIENT_SECRET', 'secret');
  });

  it('bloqueia chamadas sem cookie antes de injetar client-secret', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await proxyBackendRequest(createEvent(createCookieJar()), '/api/v1/admin/merchants');

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('faz refresh e reexecuta uma vez quando o backend retorna 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routeMessage(401))
      .mockResolvedValueOnce(routeMessage(200, {
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
        expiresIn: 3600
      }))
      .mockResolvedValueOnce(routeMessage(200, { items: [], total: 0 }));
    vi.stubGlobal('fetch', fetchMock);

    const cookies = createCookieJar({
      access_token: 'old_access',
      refresh_token: 'old_refresh'
    });

    const response = await proxyBackendRequest(createEvent(cookies), '/api/v1/admin/merchants');

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toBe('https://backend.test/api/v1/admin/merchants?limit=10');
    expect(fetchMock.mock.calls[1][0]).toBe('https://backend.test/api/v1/auth/admin/refresh');
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('authorization')).toBe('Bearer old_access');
    expect((fetchMock.mock.calls[2][1].headers as Headers).get('authorization')).toBe('Bearer new_access');
    expect((fetchMock.mock.calls[2][1].headers as Headers).get('client-secret')).toBe('secret');
    expect(cookies.get('access_token')).toBe('new_access');
    expect(cookies.get('refresh_token')).toBe('new_refresh');
  });

  it('limpa cookies quando refresh falha depois de 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routeMessage(401))
      .mockResolvedValueOnce(routeMessage(401));
    vi.stubGlobal('fetch', fetchMock);

    const cookies = createCookieJar({
      access_token: 'old_access',
      refresh_token: 'old_refresh'
    });

    const response = await proxyBackendRequest(createEvent(cookies), '/api/v1/admin/merchants');

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cookies.get('access_token')).toBeUndefined();
    expect(cookies.get('refresh_token')).toBeUndefined();
  });
});
