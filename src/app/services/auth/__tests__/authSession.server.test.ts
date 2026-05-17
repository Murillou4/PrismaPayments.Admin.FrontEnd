import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import {
  authSessionTestHooks,
  clearAuthCookies,
  decodeAdminRole,
  refreshAdminSession
} from '$appmod/services/auth/authSession.server';

function createCookieJar(initial: Record<string, string> = {}): Cookies {
  const jar = new Map(Object.entries(initial));
  return {
    get: (name: string) => jar.get(name),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name)
  } as unknown as Cookies;
}

function jwtWithRole(role: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role }));
  return `${header}.${payload}.`;
}

describe('auth session cookies', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('PRIVATE_API_BASE_URL', 'https://backend.test');
    vi.stubEnv('PRIVATE_CLIENT_SECRET', 'secret');
  });

  it('decodifica role do JWT sem depender de sessionStorage', () => {
    expect(decodeAdminRole(jwtWithRole('SUPER_ADMIN'))).toBe('SUPER_ADMIN');
    expect(decodeAdminRole('invalid')).toBeNull();
  });

  it('deduplica refresh concorrente por refresh token', async () => {
    const accessToken = jwtWithRole('ADMIN');
    const fetchMock = vi.fn(async () => Response.json({
      responseType: 'OK',
      message: 'ok',
      title: 'OK',
      status: 200,
      data: { accessToken, refreshToken: 'refresh_2', expiresIn: 3600 },
      extendedResultCode: 'OK',
      date: new Date().toISOString()
    }));
    vi.stubGlobal('fetch', fetchMock);

    const firstCookies = createCookieJar({ refresh_token: 'refresh_1' });
    const secondCookies = createCookieJar({ refresh_token: 'refresh_1' });

    const [first, second] = await Promise.all([
      refreshAdminSession(firstCookies),
      refreshAdminSession(secondCookies)
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first?.accessToken).toBe(accessToken);
    expect(second?.refreshToken).toBe('refresh_2');
    expect(authSessionTestHooks.getQueuedRefreshCount()).toBe(0);
    expect(firstCookies.get('access_token')).toBe(accessToken);
    expect(secondCookies.get('refresh_token')).toBe('refresh_2');
  });

  it('limpa cookies quando o refresh falha', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      responseType: 'UNAUTHORIZED',
      message: 'expired',
      title: 'Expired',
      status: 401,
      data: null,
      extendedResultCode: 'UNAUTHORIZED',
      date: new Date().toISOString()
    }, { status: 401 })));

    const cookies = createCookieJar({
      access_token: 'old',
      refresh_token: 'refresh_1'
    });

    expect(await refreshAdminSession(cookies)).toBeNull();
    expect(cookies.get('access_token')).toBeUndefined();
    expect(cookies.get('refresh_token')).toBeUndefined();
  });

  it('clearAuthCookies remove access e refresh', () => {
    const cookies = createCookieJar({
      access_token: 'access',
      refresh_token: 'refresh'
    });

    clearAuthCookies(cookies);

    expect(cookies.get('access_token')).toBeUndefined();
    expect(cookies.get('refresh_token')).toBeUndefined();
  });
});
