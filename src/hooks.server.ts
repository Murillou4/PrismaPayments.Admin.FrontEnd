import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getAuthSession, refreshAdminSession } from '$appmod/services/auth/authSession.server';

const PUBLIC_ROUTES = ['/login', '/logout', '/forgot-password', '/reset-password', '/api/internal/backend'];

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const isPublic = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  let session = getAuthSession(event.cookies);

  if (!isPublic && !session.accessToken && session.refreshToken) {
    const refreshed = await refreshAdminSession(event.cookies);
    session = getAuthSession(event.cookies);
    if (!refreshed?.accessToken) {
      throw redirect(303, '/login');
    }
  }

  event.locals.accessToken = session.accessToken;
  event.locals.adminRole = session.adminRole;

  if (!isPublic && !session.accessToken) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
