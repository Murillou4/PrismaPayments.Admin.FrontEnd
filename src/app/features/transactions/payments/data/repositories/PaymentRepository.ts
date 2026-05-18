import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import type { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import type {
  PaginatedPayments,
  Payment,
  ListPaymentsParams
} from '../../domain/entities/Payment';

export class PaymentRepository implements IPaymentRepository {
  async listPayments(params: ListPaymentsParams): Promise<Either<Failure, PaginatedPayments>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const result = await fetchAdminQuery(
      adminQueryKeys.payments.list(params),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_PAYMENTS, {
        skip,
        limit,
        merchantId: params.merchantId,
        status: params.status,
        method: params.method
      })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<Payment>(result.value, { skip, limit }) }
      : result;
  }

  async getById(id: string): Promise<Either<Failure, Payment>> {
    return fetchAdminQuery(
      adminQueryKeys.payments.detail(id),
      () => apiClient.get<Payment>(API_PATHS.ADMIN_PAYMENT(id))
    );
  }
}
