import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import type { PaymentProvider, ProviderCollection } from '../../domain/entities/Provider';

export class ProviderRepository {
  async list(): Promise<Either<Failure, ProviderCollection>> {
    const result = apiResponseToEither<unknown>(await apiClient.get<unknown>(API_PATHS.ADMIN_PROVIDERS));

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<PaymentProvider>(result.value) }
      : result;
  }
}
