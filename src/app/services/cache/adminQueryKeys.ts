import type { AdminDashboardFilters } from '$appmod/features/dashboard/domain/entities/AdminDashboardResponse';
import type { DashboardPeriod } from '$appmod/features/dashboard/domain/entities/DashboardSeries';
import type { ListMerchantsParams } from '$appmod/features/merchants/domain/entities/Merchant';
import type { ListPaymentsParams } from '$appmod/features/transactions/payments/domain/entities/Payment';
import type { ListWithdrawalsParams } from '$appmod/features/transactions/withdrawals/domain/entities/Withdrawal';
import type { ListDisputesParams } from '$appmod/features/disputes/domain/entities/Dispute';

function stableParams<T extends Record<string, unknown>>(params?: T): Record<string, unknown> {
  if (!params) return {};

  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

export const adminQueryKeys = {
  dashboard: {
    all: ['admin', 'dashboard'] as const,
    summary: (filters?: AdminDashboardFilters) =>
      ['admin', 'dashboard', 'summary', stableParams(filters as Record<string, unknown>)] as const,
    series: (period: DashboardPeriod) =>
      ['admin', 'dashboard', 'series', period] as const
  },
  merchants: {
    all: ['admin', 'merchants'] as const,
    list: (params?: ListMerchantsParams) =>
      ['admin', 'merchants', 'list', stableParams(params as Record<string, unknown>)] as const,
    detail: (id: string) => ['admin', 'merchants', 'detail', id] as const,
    documents: (id: string) => ['admin', 'merchants', 'documents', id] as const,
    credentials: (id: string) => ['admin', 'merchants', 'credentials', id] as const,
    tenants: () => ['admin', 'merchants', 'tenants'] as const
  },
  tenants: {
    all: ['admin', 'tenants'] as const,
    list: (params?: Record<string, unknown>) =>
      ['admin', 'tenants', 'list', stableParams(params)] as const,
    detail: (id: string) => ['admin', 'tenants', 'detail', id] as const
  },
  adminUsers: {
    all: ['admin', 'users'] as const,
    list: (params?: Record<string, unknown>) =>
      ['admin', 'users', 'list', stableParams(params)] as const
  },
  payments: {
    all: ['admin', 'payments'] as const,
    list: (params?: ListPaymentsParams) =>
      ['admin', 'payments', 'list', stableParams(params as Record<string, unknown>)] as const,
    detail: (id: string) => ['admin', 'payments', 'detail', id] as const
  },
  withdrawals: {
    all: ['admin', 'withdrawals'] as const,
    list: (params?: ListWithdrawalsParams) =>
      ['admin', 'withdrawals', 'list', stableParams(params as Record<string, unknown>)] as const,
    detail: (id: string) => ['admin', 'withdrawals', 'detail', id] as const
  },
  disputes: {
    all: ['admin', 'disputes'] as const,
    list: (params?: ListDisputesParams) =>
      ['admin', 'disputes', 'list', stableParams(params as Record<string, unknown>)] as const,
    detail: (id: string) => ['admin', 'disputes', 'detail', id] as const
  },
  audit: {
    all: ['admin', 'audit'] as const,
    list: (params?: Record<string, unknown>) =>
      ['admin', 'audit', 'list', stableParams(params)] as const
  },
  providers: {
    all: ['admin', 'providers'] as const
  },
  fees: {
    all: ['admin', 'fees'] as const,
    list: (params?: Record<string, unknown>) =>
      ['admin', 'fees', 'list', stableParams(params)] as const
  },
  diagnostics: {
    all: ['admin', 'diagnostics'] as const,
    list: (params?: Record<string, unknown>) =>
      ['admin', 'diagnostics', 'list', stableParams(params)] as const,
    stats: (params?: Record<string, unknown>) =>
      ['admin', 'diagnostics', 'stats', stableParams(params)] as const,
    detail: (id: string) => ['admin', 'diagnostics', 'detail', id] as const,
    trace: (traceId: string) => ['admin', 'diagnostics', 'trace', traceId] as const,
    flow: (flowId: string) => ['admin', 'diagnostics', 'flow', flowId] as const
  },
  config: {
    all: ['admin', 'config'] as const
  },
  rateLimit: {
    all: ['admin', 'rate-limit'] as const
  },
  search: {
    query: (q: string) => ['admin', 'search', q] as const
  },
  authSecurity: {
    all: ['admin', 'auth-security'] as const
  }
} as const;
