import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { API_PATHS } from '$core/constants/apiPaths';
import {
  clearPendingTwoFactorLogin,
  getPendingTwoFactorLogin,
  setAuthCookies,
  type AuthTokens
} from '$appmod/services/auth/authSession.server';
import { postAdminAuth } from '$appmod/services/auth/adminAuthActions.server';

interface TwoFactorLoginResponse extends AuthTokens {
  requiresTwoFactor?: boolean;
}

export const load: PageServerLoad = async ({ cookies, url }) => {
  const pending = getPendingTwoFactorLogin(cookies);
  return {
    email: pending?.email ?? url.searchParams.get('email') ?? '',
    hasPendingChallenge: Boolean(pending)
  };
};

export const actions: Actions = {
  verify: async ({ request, cookies }) => {
    const form = await request.formData();
    const pending = getPendingTwoFactorLogin(cookies);
    const email = String(form.get('email') ?? pending?.email ?? '').trim();
    const password = String(form.get('password') ?? pending?.password ?? '');
    const code = String(form.get('code') ?? '').trim();

    if (!email || !password || !/^\d{6}$/.test(code)) {
      return fail(400, { error: 'Informe email, senha e codigo de 6 digitos.', email });
    }

    const response = await postAdminAuth<TwoFactorLoginResponse>(
      API_PATHS.AUTH_ADMIN_2FA_LOGIN,
      { email, password, code }
    );
    const data = response.body?.data;

    if (!response.ok || !data?.accessToken || !data.refreshToken) {
      return fail(response.status === 401 ? 401 : response.status, {
        error: response.body?.message ?? 'Codigo 2FA invalido.',
        email
      });
    }

    clearPendingTwoFactorLogin(cookies);
    setAuthCookies(cookies, data);
    return { success: true };
  }
};
