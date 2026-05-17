import type { Cookies } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { jwtDecode } from 'jwt-decode';
import type { ApiResponse } from '$appmod/services/api/apiResponse';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const PENDING_2FA_COOKIE = 'pending_admin_2fa';
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 60 * 60;
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PENDING_2FA_MAX_AGE_SECONDS = 60 * 5;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthSession {
  accessToken: string | null;
  refreshToken: string | null;
  adminRole: string | null;
}

export interface PendingTwoFactorLogin {
  email: string;
  password: string;
}

interface TokenClaims {
  role?: string;
}

interface RefreshState {
  promise: Promise<AuthTokens | null>;
  refs: number;
}

const refreshQueue = new Map<string, RefreshState>();

function getPrivateEnv(name: string): string {
  const runtime = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name] ?? privateEnv[name] ?? '';
}

function isSecureCookie(): boolean {
  return !dev;
}

export function decodeAdminRole(accessToken: string | null): string | null {
  if (!accessToken) return null;

  try {
    return jwtDecode<TokenClaims>(accessToken).role ?? null;
  } catch {
    return null;
  }
}

export function getAuthSession(cookies: Cookies): AuthSession {
  const accessToken = cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
  const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE) ?? null;

  return {
    accessToken,
    refreshToken,
    adminRole: decodeAdminRole(accessToken)
  };
}

export function setAuthCookies(cookies: Cookies, tokens: AuthTokens): void {
  cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'strict',
    path: '/',
    maxAge: tokens.expiresIn ?? DEFAULT_ACCESS_MAX_AGE_SECONDS
  });

  cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'strict',
    path: '/',
    maxAge: DEFAULT_REFRESH_MAX_AGE_SECONDS
  });
}

export function clearAuthCookies(cookies: Cookies): void {
  cookies.delete(ACCESS_TOKEN_COOKIE, { path: '/' });
  cookies.delete(REFRESH_TOKEN_COOKIE, { path: '/' });
}

export function setPendingTwoFactorLogin(cookies: Cookies, payload: PendingTwoFactorLogin): void {
  cookies.set(PENDING_2FA_COOKIE, encodeURIComponent(JSON.stringify(payload)), {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'strict',
    path: '/',
    maxAge: PENDING_2FA_MAX_AGE_SECONDS
  });
}

export function getPendingTwoFactorLogin(cookies: Cookies): PendingTwoFactorLogin | null {
  const raw = cookies.get(PENDING_2FA_COOKIE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<PendingTwoFactorLogin>;
    return typeof parsed.email === 'string' && typeof parsed.password === 'string'
      ? { email: parsed.email, password: parsed.password }
      : null;
  } catch {
    return null;
  }
}

export function clearPendingTwoFactorLogin(cookies: Cookies): void {
  cookies.delete(PENDING_2FA_COOKIE, { path: '/' });
}

async function executeRefresh(refreshToken: string): Promise<AuthTokens | null> {
  const baseUrl = getPrivateEnv('PRIVATE_API_BASE_URL');
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/admin/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getPrivateEnv('PRIVATE_CLIENT_SECRET')
          ? { 'client-secret': getPrivateEnv('PRIVATE_CLIENT_SECRET') }
          : {})
      },
      body: JSON.stringify({ refreshToken })
    });

    const body = (await response.json().catch(() => null)) as ApiResponse<AuthTokens> | null;
    if (!response.ok || !body?.data?.accessToken || !body.data.refreshToken) {
      return null;
    }

    return body.data;
  } catch {
    return null;
  }
}

export async function refreshAdminSession(cookies: Cookies): Promise<AuthTokens | null> {
  const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE);
  if (!refreshToken) {
    clearAuthCookies(cookies);
    return null;
  }

  const existing = refreshQueue.get(refreshToken);
  if (existing) {
    existing.refs += 1;
    const tokens = await existing.promise;
    if (tokens) setAuthCookies(cookies, tokens);
    else clearAuthCookies(cookies);
    return tokens;
  }

  const promise = executeRefresh(refreshToken);
  refreshQueue.set(refreshToken, { promise, refs: 1 });

  try {
    const tokens = await promise;
    if (tokens) setAuthCookies(cookies, tokens);
    else clearAuthCookies(cookies);
    return tokens;
  } finally {
    refreshQueue.delete(refreshToken);
  }
}

export const authSessionTestHooks = {
  getQueuedRefreshCount: () => refreshQueue.size
};
