import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { executeAdminMutation, fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import type { IDisputeRepository } from '../../domain/repositories/IDisputeRepository';
import type { Dispute, PaginatedDisputes, ListDisputesParams, ResolveDisputePayload } from '../../domain/entities/Dispute';

export class DisputeRepository implements IDisputeRepository {
  async listDisputes(params: ListDisputesParams): Promise<Either<Failure, PaginatedDisputes>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const result = await fetchAdminQuery(
      adminQueryKeys.disputes.list(params),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_DISPUTES, {
        skip,
        limit,
        status: params.status,
        disputeType: params.disputeType,
        merchantId: params.merchantId
      })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<Dispute>(result.value, { skip, limit }) }
      : result;
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
