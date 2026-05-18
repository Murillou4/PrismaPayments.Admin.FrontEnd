import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import { asArray, asNumber, isRecord, unwrapResponseData } from '$appmod/services/api/responseNormalizers';
import type { AdminDashboardFilters, AdminDashboardResponse } from '../../domain/entities/AdminDashboardResponse';
import type { DashboardChartData, DashboardPeriod } from '../../domain/entities/DashboardSeries';

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function normalizeAdminDashboardResponse(value: unknown): AdminDashboardResponse {
  const raw = asRecord(unwrapResponseData(value));
  const payments = asRecord(raw.payments);
  const withdrawals = asRecord(raw.withdrawals);
  const disputes = asRecord(raw.disputes);
  const merchants = asRecord(raw.merchants);
  const providers = asRecord(raw.providers);
  const queues = asRecord(raw.queues);
  const webhookFailures = asRecord(raw.webhookFailures);
  const pagination = asRecord(raw.pagination);

  return {
    filters: isRecord(raw.filters) ? raw.filters as Record<string, string> : {},
    pagination: {
      skip: asNumber(pagination.skip),
      limit: asNumber(pagination.limit)
    },
    payments: {
      total: asNumber(payments.total),
      paid: asNumber(payments.paid),
      failed: asNumber(payments.failed),
      processing: asNumber(payments.processing),
      volume: asNumber(payments.volume),
      methodBreakdown: asArray(payments.methodBreakdown),
      items: asArray(payments.items)
    },
    withdrawals: {
      total: asNumber(withdrawals.total),
      processing: asNumber(withdrawals.processing),
      failed: asNumber(withdrawals.failed),
      todayVolume: asNumber(withdrawals.todayVolume),
      items: asArray(withdrawals.items)
    },
    disputes: {
      total: asNumber(disputes.total),
      open: asNumber(disputes.open),
      items: asArray(disputes.items)
    },
    merchants: {
      total: asNumber(merchants.total),
      active: asNumber(merchants.active),
      pending: asNumber(merchants.pending),
      suspended: asNumber(merchants.suspended),
      pendingVerification: asNumber(merchants.pendingVerification),
      items: asArray(merchants.items)
    },
    providers: {
      total: asNumber(providers.total),
      active: asNumber(providers.active),
      unhealthy: asNumber(providers.unhealthy),
      items: asArray(providers.items)
    },
    queues: {
      pendingMerchantVerification: asNumber(queues.pendingMerchantVerification),
      failedWebhooks: asNumber(queues.failedWebhooks),
      openDisputes: asNumber(queues.openDisputes),
      failedPayments: asNumber(queues.failedPayments)
    },
    webhookFailures: {
      total: asNumber(webhookFailures.total),
      items: asArray(webhookFailures.items)
    }
  };
}

export class DashboardRepository {
  async getDashboard(filters?: AdminDashboardFilters): Promise<Either<Failure, AdminDashboardResponse>> {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (filters) {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.withdrawalStatus) params.withdrawalStatus = filters.withdrawalStatus;
      if (filters.method) params.method = filters.method;
      if (filters.currency) params.currency = filters.currency;
      if (filters.merchantId) params.merchantId = filters.merchantId;
      if (filters.merchantStatus) params.merchantStatus = filters.merchantStatus;
      if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;
      if (filters.disputeStatus) params.disputeStatus = filters.disputeStatus;
      if (filters.disputeType) params.disputeType = filters.disputeType;
      if (filters.providerName) params.providerName = filters.providerName;
      if (filters.skip != null) params.skip = filters.skip;
      if (filters.limit != null) params.limit = filters.limit;
    }

    const result = await fetchAdminQuery(
      adminQueryKeys.dashboard.summary(filters),
      () => apiClient.get<unknown>(API_PATHS.DASHBOARD_ADMIN, params)
    );

    return result.ok
      ? { ok: true, value: normalizeAdminDashboardResponse(result.value) }
      : result;
  }

  async getChartData(period: DashboardPeriod): Promise<Either<Failure, DashboardChartData>> {
    return fetchAdminQuery(
      adminQueryKeys.dashboard.series(period),
      () => apiClient.get<DashboardChartData>(API_PATHS.DASHBOARD_ADMIN_SERIES(period))
    );
  }
}
