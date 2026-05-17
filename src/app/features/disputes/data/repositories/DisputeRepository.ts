import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import type { ApiResponse } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { executeAdminMutation, fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import type { IDisputeRepository } from '../../domain/repositories/IDisputeRepository';
import type { Dispute, PaginatedDisputes, ListDisputesParams, ResolveDisputePayload } from '../../domain/entities/Dispute';

function normalizeDisputePage(
  response: ApiResponse<unknown>,
  page: number,
  limit: number
): ApiResponse<PaginatedDisputes> {
  if (response.status < 200 || response.status >= 300 || !response.data) {
    return response as ApiResponse<PaginatedDisputes>;
  }

  const raw = response.data;
  const items = Array.isArray(raw)
    ? raw as Dispute[]
    : (raw as PaginatedDisputes).items ?? [];
  const total = Array.isArray(raw)
    ? items.length
    : (raw as PaginatedDisputes).total ?? items.length;

  return {
    ...response,
    data: {
      items,
      total,
      skip: (page - 1) * limit,
      limit
    }
  };
}

export class DisputeRepository implements IDisputeRepository {
  async listDisputes(params: ListDisputesParams): Promise<Either<Failure, PaginatedDisputes>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return fetchAdminQuery(
      adminQueryKeys.disputes.list(params),
      async () => normalizeDisputePage(
        await apiClient.get<unknown>(API_PATHS.ADMIN_DISPUTES, {
          skip: (page - 1) * limit,
          limit,
          status: params.status,
          disputeType: params.disputeType,
          merchantId: params.merchantId
        }),
        page,
        limit
      )
    );
  }

  async getById(id: string): Promise<Either<Failure, Dispute>> {
    return fetchAdminQuery(
      adminQueryKeys.disputes.detail(id),
      () => apiClient.get<Dispute>(API_PATHS.ADMIN_DISPUTE(id))
    );
  }

  async resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Either<Failure, Dispute>> {
    return executeAdminMutation(
      () => apiClient.put<Dispute>(API_PATHS.ADMIN_DISPUTE(id), payload),
      [
        adminQueryKeys.disputes.all,
        adminQueryKeys.disputes.detail(id),
        adminQueryKeys.dashboard.all
      ]
    );
  }
}
