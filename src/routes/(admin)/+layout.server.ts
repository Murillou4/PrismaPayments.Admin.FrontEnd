import type { LayoutServerLoad } from './$types';
import type { ApiResponse } from '$appmod/services/api/apiResponse';

interface AdminMe {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  tenantId?: string | null;
  tenantName?: string | null;
  twoFactorEnabled?: boolean;
}

async function loadAdminMe(fetch: typeof globalThis.fetch): Promise<AdminMe | null> {
  try {
    const response = await fetch('/api/internal/backend/api/v1/admin/me', {
      headers: { accept: 'application/json' }
    });
    const body = await response.json().catch(() => null) as ApiResponse<AdminMe> | null;
    return response.ok && body?.data
      ? body.data
      : null;
  } catch {
    return null;
  }
}

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
  const admin = await loadAdminMe(fetch);
  return {
    admin,
    adminRole: admin?.role ?? locals.adminRole
  };
};
