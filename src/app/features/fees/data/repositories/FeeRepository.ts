import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import type {
  FeeRule,
  FeeRuleList,
  FeeRulePayload,
  FeeSimulationPayload,
  FeeSimulationResult
} from '../../domain/entities/Fee';

export class FeeRepository {
  async list(page = 1, pageSize = 20): Promise<Either<Failure, FeeRuleList>> {
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.FEES_RULES, { page, pageSize })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<FeeRule>(result.value, { page, pageSize, limit: pageSize }) }
      : result;
  }

  async create(payload: FeeRulePayload): Promise<Either<Failure, FeeRule>> {
    return apiResponseToEither(await apiClient.post<FeeRule>(API_PATHS.FEES_RULES, payload));
  }

  async update(id: string, payload: Partial<FeeRulePayload>): Promise<Either<Failure, FeeRule>> {
    return apiResponseToEither(await apiClient.put<FeeRule>(API_PATHS.FEES_RULE(id), payload));
  }

  async delete(id: string): Promise<Either<Failure, void>> {
    return apiResponseToEither(await apiClient.delete<void>(API_PATHS.FEES_RULE(id)));
  }

  async simulate(payload: FeeSimulationPayload): Promise<Either<Failure, FeeSimulationResult>> {
    return apiResponseToEither(
      await apiClient.post<FeeSimulationResult>(API_PATHS.FEES_SIMULATE, payload)
    );
  }
}
