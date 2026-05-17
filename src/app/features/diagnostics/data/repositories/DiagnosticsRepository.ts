import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type {
  DiagnosticLogDetail,
  DiagnosticsFilters,
  DiagnosticsList,
  DiagnosticsStats,
  PurgeResult
} from '../../domain/entities/Diagnostics';

function paramsFromFilters(filters: DiagnosticsFilters = {}, paged = true) {
  const limit = filters.limit ?? 30;
  const page = filters.page ?? 1;
  return {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    level: filters.level || undefined,
    statusCode: filters.statusCode ?? undefined,
    method: filters.method || undefined,
    path: filters.path || undefined,
    traceId: filters.traceId || undefined,
    merchantId: filters.merchantId || undefined,
    hasError: filters.hasError ?? undefined,
    skip: paged ? (page - 1) * limit : undefined,
    limit: paged ? limit : undefined
  };
}

export class DiagnosticsRepository {
  async list(filters?: DiagnosticsFilters): Promise<Either<Failure, DiagnosticsList>> {
    return apiResponseToEither(
      await apiClient.get<DiagnosticsList>(API_PATHS.DIAGNOSTICS_LOGS, paramsFromFilters(filters))
    );
  }

  async stats(filters?: DiagnosticsFilters): Promise<Either<Failure, DiagnosticsStats>> {
    return apiResponseToEither(
      await apiClient.get<DiagnosticsStats>(API_PATHS.DIAGNOSTICS_STATS, paramsFromFilters(filters, false))
    );
  }

  async getById(id: string): Promise<Either<Failure, DiagnosticLogDetail>> {
    return apiResponseToEither(await apiClient.get<DiagnosticLogDetail>(API_PATHS.DIAGNOSTICS_LOG(id)));
  }

  async getTrace(traceId: string): Promise<Either<Failure, DiagnosticLogDetail[]>> {
    return apiResponseToEither(await apiClient.get<DiagnosticLogDetail[]>(API_PATHS.DIAGNOSTICS_TRACE(traceId)));
  }

  async purge(olderThanDays: number): Promise<Either<Failure, PurgeResult>> {
    return apiResponseToEither(
      await apiClient.delete<PurgeResult>(API_PATHS.DIAGNOSTICS_PURGE, { olderThanDays })
    );
  }
}
