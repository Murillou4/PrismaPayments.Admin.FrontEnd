import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type { ProviderCollection } from '../../domain/entities/Provider';

export class ProviderRepository {
  async list(): Promise<Either<Failure, ProviderCollection>> {
    return apiResponseToEither(await apiClient.get<ProviderCollection>(API_PATHS.ADMIN_PROVIDERS));
  }
}
