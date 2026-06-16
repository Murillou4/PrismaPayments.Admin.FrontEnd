import { beforeEach, describe, it, expect, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { tokenStorage } from '$appmod/services/storage/tokenStorage';
import {
  setAuthCookies,
  clearAuthCookies,
  getAuthSession,
  decodeAdminRole,
  refreshAdminSession,
  authSessionTestHooks
} from '$appmod/services/auth/authSession.server';
import { hasPermission, requireAuth, requireRole } from '$appmod/shared/guards/adminGuard';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

interface CookieSetOptions {
  httpOnly?: boolean;
  sameSite?: string;
  path?: string;
  maxAge?: number;
}

/** Cookie jar de teste que tambem registra as opcoes usadas em cada `set`. */
function createCookieJar(initial: Record<string, string> = {}) {
  const jar = new Map(Object.entries(initial));
  const opts = new Map<string, CookieSetOptions>();
  const cookies = {
    get: (name: string) => jar.get(name),
    set: (name: string, value: string, options?: CookieSetOptions) => {
      jar.set(name, value);
      if (options) opts.set(name, options);
    },
    delete: (name: string) => void jar.delete(name)
  } as unknown as Cookies;
  return { cookies, jar, optionsFor: (name: string) => opts.get(name) };
}

/** JWT nao assinado (alg:none) apenas para exercitar o decode do payload. */
function jwtWithRole(role: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role, sub: 'admin_1' }));
  return `${header}.${payload}.`;
}

describe('AUTH-01: login com email/senha', () => {
  it('grava tokens em cookies, nunca em sessionStorage acessivel ao client', () => {
    const { cookies, jar } = createCookieJar();

    setAuthCookies(cookies, { accessToken: jwtWithRole('ADMIN'), refreshToken: 'refresh_1' });

    // Tokens vivem no cookie jar (HttpOnly), nao no storage do client.
    expect(jar.get(ACCESS_COOKIE)).toBeTruthy();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});

describe('AUTH-02: tokens persistidos apenas em cookies HttpOnly', () => {
  it('cookie access_token e marcado HttpOnly, sameSite strict e path raiz', () => {
    const { cookies, optionsFor } = createCookieJar();

    setAuthCookies(cookies, { accessToken: jwtWithRole('ADMIN'), refreshToken: 'refresh_1' });

    const accessOpts = optionsFor(ACCESS_COOKIE);
    const refreshOpts = optionsFor(REFRESH_COOKIE);
    expect(accessOpts?.httpOnly).toBe(true);
    expect(accessOpts?.sameSite).toBe('strict');
    expect(accessOpts?.path).toBe('/');
    expect(refreshOpts?.httpOnly).toBe(true);
  });

  it('sessionStorage nao contem access_token nem refresh_token apos login', () => {
    const { cookies } = createCookieJar();

    setAuthCookies(cookies, { accessToken: jwtWithRole('ADMIN'), refreshToken: 'refresh_1' });

    expect(sessionStorage.getItem('prisma_admin_access_token')).toBeNull();
    expect(sessionStorage.getItem('prisma_admin_refresh_token')).toBeNull();
  });
});

describe('AUTH-03: refresh transparente com fila de concorrencia', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('PRIVATE_API_BASE_URL', 'https://backend.test');
    vi.stubEnv('PRIVATE_CLIENT_SECRET', 'secret');
  });

  function mockRefreshOk(accessToken: string, refreshToken: string) {
    const fetchMock = vi.fn(async () =>
      Response.json({
        responseType: 'OK',
        message: 'ok',
        title: 'OK',
        status: 200,
        data: { accessToken, refreshToken, expiresIn: 3600 },
        date: new Date().toISOString()
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('401 dispara refresh e disponibiliza novo access token nos cookies', async () => {
    const newAccess = jwtWithRole('ADMIN');
    mockRefreshOk(newAccess, 'refresh_2');
    const { cookies, jar } = createCookieJar({ refresh_token: 'refresh_1' });

    const tokens = await refreshAdminSession(cookies);

    expect(tokens?.accessToken).toBe(newAccess);
    // A requisicao original pode ser re-executada com o token renovado.
    expect(jar.get(ACCESS_COOKIE)).toBe(newAccess);
    expect(jar.get(REFRESH_COOKIE)).toBe('refresh_2');
  });

  it('multiplos 401 concorrentes disparam apenas um refresh', async () => {
    const fetchMock = mockRefreshOk(jwtWithRole('ADMIN'), 'refresh_2');
    const a = createCookieJar({ refresh_token: 'refresh_1' });
    const b = createCookieJar({ refresh_token: 'refresh_1' });

    await Promise.all([refreshAdminSession(a.cookies), refreshAdminSession(b.cookies)]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(authSessionTestHooks.getQueuedRefreshCount()).toBe(0);
  });
});

describe('AUTH-04: rotas admin redirecionam sem cookie', () => {
  it('requireAuth redireciona para /login quando role ausente', () => {
    try {
      requireAuth(null);
      expect.unreachable('requireAuth deveria lancar redirect');
    } catch (e) {
      expect((e as { status?: number }).status).toBe(303);
      expect((e as { location?: string }).location).toBe('/login');
    }
  });

  it('requireAuth permite acesso quando ha role', () => {
    expect(() => requireAuth('ADMIN')).not.toThrow();
  });

  it('requireRole redireciona para /dashboard sem permissao suficiente', () => {
    try {
      requireRole('VIEWER', 'ADMIN');
      expect.unreachable('requireRole deveria lancar redirect');
    } catch (e) {
      expect((e as { status?: number }).status).toBe(303);
      expect((e as { location?: string }).location).toBe('/dashboard');
    }
  });

  it('hasPermission respeita a hierarquia de roles', () => {
    expect(hasPermission('SUPER_ADMIN', 'ADMIN')).toBe(true);
    expect(hasPermission('ADMIN', 'ADMIN')).toBe(true);
    expect(hasPermission('SUPPORT', 'ADMIN')).toBe(false);
    expect(hasPermission(null, 'VIEWER')).toBe(false);
    expect(hasPermission('ROLE_INEXISTENTE', 'VIEWER')).toBe(false);
  });
});

describe('AUTH-05: role extraido do JWT', () => {
  it('decodeJwtPayload extrai o campo role do payload', () => {
    const payload = tokenStorage.decodeJwtPayload(jwtWithRole('SUPER_ADMIN'));
    expect(payload?.role).toBe('SUPER_ADMIN');
    expect(tokenStorage.decodeJwtPayload('invalido')).toBeNull();
  });

  it('decodeAdminRole le a role do cookie de sessao server-side', () => {
    const { cookies } = createCookieJar({ access_token: jwtWithRole('SUPPORT') });
    expect(getAuthSession(cookies).adminRole).toBe('SUPPORT');
    expect(decodeAdminRole(null)).toBeNull();
  });

  it('getAdminRole do client stub retorna null (tokens nao ficam no client)', () => {
    sessionStorage.removeItem('prisma_admin_access_token');
    expect(tokenStorage.getAdminRole()).toBeNull();
  });
});

describe('AUTH-06: logout limpa tokens', () => {
  it('clearAuthCookies remove access_token e refresh_token', () => {
    const { cookies, jar } = createCookieJar({ access_token: 'access', refresh_token: 'refresh' });

    clearAuthCookies(cookies);

    expect(jar.get(ACCESS_COOKIE)).toBeUndefined();
    expect(jar.get(REFRESH_COOKIE)).toBeUndefined();
  });

  it('clearTokens remove qualquer residuo legado do sessionStorage', () => {
    sessionStorage.setItem('prisma_admin_access_token', 'tok1');
    sessionStorage.setItem('prisma_admin_refresh_token', 'tok2');
    tokenStorage.clearTokens();
    expect(sessionStorage.getItem('prisma_admin_access_token')).toBeNull();
    expect(sessionStorage.getItem('prisma_admin_refresh_token')).toBeNull();
  });
});
