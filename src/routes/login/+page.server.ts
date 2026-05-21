import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_PATHS } from '$core/constants/apiPaths';
import {
  clearAuthCookies,
  clearPendingTwoFactorLogin,
  setAuthCookies,
  setPendingTwoFactorLogin,
  type AuthTokens
} from '$appmod/services/auth/authSession.server';
import { hasBackendBaseUrl, postAdminAuth } from '$appmod/services/auth/adminAuthActions.server';

interface LoginResponseBody {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresTwoFactor?: boolean;
}

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'E-mail ou senha invalidos.' });
    }

    if (!hasBackendBaseUrl()) {
      return fail(500, { error: 'PRIVATE_API_BASE_URL nao esta configurada.' });
    }

    const response = await postAdminAuth<LoginResponseBody>(API_PATHS.AUTH_ADMIN_LOGIN, { email, password });
    const authData = response.body?.data;

    if (response.ok && authData?.requiresTwoFactor) {
      clearAuthCookies(cookies);
      setPendingTwoFactorLogin(cookies, { email, password });
      return { twoFactorRequired: true, email };
    }

    if (!response.ok || !authData?.accessToken || !authData.refreshToken) {
      clearAuthCookies(cookies);
      clearPendingTwoFactorLogin(cookies);

      if (response.status === 503) {
        return fail(503, {
          error: 'Falha ao conectar com o backend. Confirme que o Prisma Dev Launcher esta rodando.'
        });
      }

      return fail(response.status === 401 ? 401 : response.status, {
        error: response.body?.message ?? 'E-mail ou senha invalidos.'
      });
    }

    clearPendingTwoFactorLogin(cookies);
    setAuthCookies(cookies, authData as AuthTokens);
    return { success: true };
  },

  logout: async ({ cookies }) => {
    clearAuthCookies(cookies);
    return { success: true };
  }
};
