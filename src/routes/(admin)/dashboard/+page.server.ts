import type { PageServerLoad } from './$types';
import type { ApiResponse } from '$appmod/services/api/apiResponse';
import type { AdminDashboardResponse } from '$appmod/features/dashboard/domain/entities/AdminDashboardResponse';

function getPeriodDates(): { start: string; end: string } {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  return { start: start.toISOString().slice(0, 10), end };
}

export const load: PageServerLoad = async ({ fetch }) => {
  const { start, end } = getPeriodDates();
  const params = new URLSearchParams({
    startDate: start,
    endDate: end,
    skip: '0',
    limit: '100'
  });

  try {
    const response = await fetch(`/api/internal/backend/api/v1/dashboard/admin?${params}`, {
      headers: { accept: 'application/json' }
    });
    const body = (await response.json().catch(() => null)) as ApiResponse<AdminDashboardResponse> | null;

    return {
      initialDashboard: response.ok && body?.data ? body.data : null,
      initialError: response.ok ? null : (body?.message ?? 'Nao consegui carregar os dados do dashboard.'),
      initialStartDate: start,
      initialEndDate: end
    };
  } catch {
    return {
      initialDashboard: null,
      initialError: 'Nao consegui carregar os dados do dashboard.',
      initialStartDate: start,
      initialEndDate: end
    };
  }
};
