import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { clearAuthCookies } from '$appmod/services/auth/authSession.server';

export const actions: Actions = {
  default: async ({ cookies }) => {
    clearAuthCookies(cookies);
    throw redirect(303, '/login');
  }
};
