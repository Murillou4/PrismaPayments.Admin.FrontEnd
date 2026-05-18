import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import type { AuditFilters, AuditTimeline, AuditTimelineItem } from '../../domain/entities/Audit';

export class AuditRepository {
  async list(filters: AuditFilters = {}): Promise<Either<Failure, AuditTimeline>> {
    const limit = filters.limit ?? 30;
    const page = filters.page ?? 1;
    const skip = (page - 1) * limit;
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.ADMIN_AUDIT, {
        actorType: filters.actorType || undefined,
        action: filters.action || undefined,
        skip,
        limit
      })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<AuditTimelineItem>(result.value, { skip, limit }) }
      : result;
  }
}
