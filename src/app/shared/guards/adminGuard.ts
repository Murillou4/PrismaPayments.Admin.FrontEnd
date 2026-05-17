import { redirect } from '@sveltejs/kit';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'VIEWER';

const ROLE_LEVELS: Record<AdminRole, number> = {
  VIEWER: 1,
  SUPPORT: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
};

export function hasPermission(
  userRole: AdminRole | string | null,
  requiredRole: AdminRole
): boolean {
  if (!userRole || !(userRole in ROLE_LEVELS)) return false;
  return ROLE_LEVELS[userRole as AdminRole] >= ROLE_LEVELS[requiredRole];
}

export function requireAuth(userRole: AdminRole | string | null): void {
  if (!userRole) {
    throw redirect(303, '/login');
  }
}

export function requireRole(userRole: AdminRole | string | null, requiredRole: AdminRole): void {
  requireAuth(userRole);
  if (!hasPermission(userRole, requiredRole)) {
    throw redirect(303, '/dashboard');
  }
}
