import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import {
  asArray,
  asNumber,
  isRecord,
  normalizeArrayResponse,
  normalizeCollectionResponse,
  unwrapResponseData
} from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import type {
  DiagnosticLogDetail,
  DiagnosticLogListItem,
  DiagnosticsFilters,
  DiagnosticsList,
  DiagnosticsStats,
  FlowGraph,
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
    flowId: filters.flowId || undefined,
    merchantId: filters.merchantId || undefined,
    hasError: filters.hasError ?? undefined,
    skip: paged ? (page - 1) * limit : undefined,
    limit: paged ? limit : undefined
  };
}

function normalizeDiagnosticsStats(value: unknown): DiagnosticsStats {
  const raw = unwrapResponseData(value);
  const record = isRecord(raw) ? raw : {};
  return {
    totalRequests: asNumber(record.totalRequests),
    totalErrors: asNumber(record.totalErrors),
    errorRate: asNumber(record.errorRate),
    avgResponseTimeMs: asNumber(record.avgResponseTimeMs),
    statusCodeDistribution: isRecord(record.statusCodeDistribution)
      ? record.statusCodeDistribution as Record<string, number>
      : {},
    topFailingEndpoints: asArray(record.topFailingEndpoints)
  };
}

function normalizeFlowGraph(value: unknown): FlowGraph {
  const raw = unwrapResponseData(value);
  const record = isRecord(raw) ? raw : {};
  return {
    flowId: typeof record.flowId === 'string' ? record.flowId : '',
    startedAt: typeof record.startedAt === 'string' ? record.startedAt : null,
    lastSeenAt: typeof record.lastSeenAt === 'string' ? record.lastSeenAt : null,
    nodes: asArray(record.nodes),
    edges: asArray(record.edges),
    resources: asArray(record.resources)
  };
}

export class DiagnosticsRepository {
  async list(filters?: DiagnosticsFilters): Promise<Either<Failure, DiagnosticsList>> {
    const params = paramsFromFilters(filters);
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.DIAGNOSTICS_LOGS, params)
    );

    return result.ok
      ? {
          ok: true,
          value: normalizeCollectionResponse<DiagnosticLogListItem>(result.value, {
            skip: asNumber(params.skip),
            limit: asNumber(params.limit, 30)
          })
        }
      : result;
  }

  async stats(filters?: DiagnosticsFilters): Promise<Either<Failure, DiagnosticsStats>> {
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.DIAGNOSTICS_STATS, paramsFromFilters(filters, false))
    );

    return result.ok
      ? { ok: true, value: normalizeDiagnosticsStats(result.value) }
      : result;
  }

  async getById(id: string): Promise<Either<Failure, DiagnosticLogDetail>> {
    return apiResponseToEither(await apiClient.get<DiagnosticLogDetail>(API_PATHS.DIAGNOSTICS_LOG(id)));
  }

  async getTrace(traceId: string): Promise<Either<Failure, DiagnosticLogDetail[]>> {
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.DIAGNOSTICS_TRACE(traceId))
    );

    return result.ok
      ? { ok: true, value: normalizeArrayResponse<DiagnosticLogDetail>(result.value) }
      : result;
  }

  async getFlow(flowId: string): Promise<Either<Failure, FlowGraph>> {
    const result = apiResponseToEither<unknown>(await apiClient.get<unknown>(API_PATHS.DIAGNOSTICS_FLOW(flowId)));

    return result.ok
      ? { ok: true, value: normalizeFlowGraph(result.value) }
      : result;
  }

  async purge(olderThanDays: number): Promise<Either<Failure, PurgeResult>> {
    return apiResponseToEither(
      await apiClient.delete<PurgeResult>(API_PATHS.DIAGNOSTICS_PURGE, { olderThanDays })
    );
  }
}
