import { jwtDecode } from 'jwt-decode';

const LEGACY_ACCESS_TOKEN_KEY = 'prisma_admin_access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'prisma_admin_refresh_token';

function getAccessToken(): string | null {
  return null;
}

function getRefreshToken(): string | null {
  return null;
}

function setTokens(_accessToken: string, _refreshToken: string): void {
  clearTokens();
}

function clearTokens(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return jwtDecode<Record<string, unknown>>(token);
  } catch {
    return null;
  }
}

function getAdminRole(): string | null {
  return null;
}

export const tokenStorage = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getAdminRole,
  decodeJwtPayload
};
