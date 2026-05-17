import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type {
  AdminCurrentUser,
  PlatformConfig,
  RateLimitStatus,
  SearchResponse,
  ToggleRateLimitPayload
} from '../../domain/entities/Platform';

export class PlatformRepository {
  async me(): Promise<Either<Failure, AdminCurrentUser>> {
    return apiResponseToEither(await apiClient.get<AdminCurrentUser>(API_PATHS.ADMIN_ME));
  }

  async search(q: string, limit = 8): Promise<Either<Failure, SearchResponse>> {
    return apiResponseToEither(await apiClient.get<SearchResponse>(API_PATHS.ADMIN_SEARCH, { q, limit }));
  }

  async config(): Promise<Either<Failure, PlatformConfig>> {
    return apiResponseToEither(await apiClient.get<PlatformConfig>(API_PATHS.ADMIN_CONFIG));
  }

  async rateLimit(): Promise<Either<Failure, RateLimitStatus>> {
    return apiResponseToEither(await apiClient.get<RateLimitStatus>(API_PATHS.ADMIN_RATE_LIMIT));
  }

  async toggleRateLimit(payload: ToggleRateLimitPayload): Promise<Either<Failure, RateLimitStatus>> {
    return apiResponseToEither(await apiClient.put<RateLimitStatus>(API_PATHS.ADMIN_RATE_LIMIT, payload));
  }
}
