import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type { AuditFilters, AuditTimeline } from '../../domain/entities/Audit';

export class AuditRepository {
  async list(filters: AuditFilters = {}): Promise<Either<Failure, AuditTimeline>> {
    const limit = filters.limit ?? 30;
    const page = filters.page ?? 1;
    return apiResponseToEither(
      await apiClient.get<AuditTimeline>(API_PATHS.ADMIN_AUDIT, {
        actorType: filters.actorType || undefined,
        action: filters.action || undefined,
        skip: (page - 1) * limit,
        limit
      })
    );
  }
}
