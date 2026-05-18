import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import type { IWithdrawalRepository } from '../../domain/repositories/IWithdrawalRepository';
import type {
  PaginatedWithdrawals,
  Withdrawal,
  ListWithdrawalsParams
} from '../../domain/entities/Withdrawal';

export class WithdrawalRepository implements IWithdrawalRepository {
  async listWithdrawals(params: ListWithdrawalsParams): Promise<Either<Failure, PaginatedWithdrawals>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const result = await fetchAdminQuery(
      adminQueryKeys.withdrawals.list(params),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_WITHDRAWALS, {
        skip,
        limit,
        merchantId: params.merchantId,
        status: params.status
      })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<Withdrawal>(result.value, { skip, limit }) }
      : result;
  }

  async getById(id: string): Promise<Either<Failure, Withdrawal>> {
    return fetchAdminQuery(
      adminQueryKeys.withdrawals.detail(id),
      () => apiClient.get<Withdrawal>(API_PATHS.ADMIN_WITHDRAWAL(id))
    );
  }
}
