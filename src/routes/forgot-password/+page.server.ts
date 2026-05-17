import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_PATHS } from '$core/constants/apiPaths';
import { postAdminAuth } from '$appmod/services/auth/adminAuthActions.server';
import type { MessageResponse } from '$appmod/features/auth/domain/entities/AuthSecurity';

export const actions: Actions = {
  requestReset: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();

    if (!email) {
      return fail(400, { error: 'Informe seu e-mail.', email });
    }

    const response = await postAdminAuth<MessageResponse>(API_PATHS.AUTH_ADMIN_FORGOT_PASSWORD, { email });
    if (!response.ok) {
      return fail(response.status, {
        error: response.body?.message ?? 'Nao foi possivel solicitar o reset.',
        email
      });
    }

    return {
      success: true,
      email,
      message: response.body?.data?.message ?? response.body?.message ?? 'Se o e-mail existir, o link sera enviado.'
    };
  }
};
