import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { API_PATHS } from '$core/constants/apiPaths';
import { postAdminAuth } from '$appmod/services/auth/adminAuthActions.server';
import type { MessageResponse } from '$appmod/features/auth/domain/entities/AuthSecurity';

export const load: PageServerLoad = async ({ url }) => ({
  token: url.searchParams.get('token') ?? ''
});

export const actions: Actions = {
  reset: async ({ request }) => {
    const form = await request.formData();
    const token = String(form.get('token') ?? '').trim();
    const newPassword = String(form.get('newPassword') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');

    if (!token || newPassword.length < 8 || newPassword !== confirmPassword) {
      return fail(400, {
        error: 'Informe o token e uma senha de 8+ caracteres com confirmacao igual.',
        token
      });
    }

    const response = await postAdminAuth<MessageResponse>(
      API_PATHS.AUTH_ADMIN_RESET_PASSWORD,
      { token, newPassword }
    );

    if (!response.ok) {
      return fail(response.status, {
        error: response.body?.message ?? 'Nao foi possivel redefinir a senha.',
        token
      });
    }

    return {
      success: true,
      message: response.body?.data?.message ?? response.body?.message ?? 'Senha redefinida com sucesso.'
    };
  }
};
