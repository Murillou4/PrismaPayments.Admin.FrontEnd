import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import { API_PATHS } from '$core/constants/apiPaths';
import type { IAdminUsersRepository } from '../../domain/repositories/IAdminUsersRepository';
import type {
  AdminUser,
  AdminUserCollection,
  CreateAdminUserPayload,
  ListAdminUsersParams,
  UpdateAdminUserPayload
} from '../../domain/entities/AdminUser';

export class AdminUsersRepository implements IAdminUsersRepository {
  async list(params: ListAdminUsersParams = {}): Promise<Either<Failure, AdminUserCollection>> {
    const limit = params.limit ?? 20;
    const page = params.page ?? 1;
    const skip = (page - 1) * limit;
    const result = apiResponseToEither<unknown>(
      await apiClient.get<unknown>(API_PATHS.ADMIN_USERS, {
        skip,
        limit
      })
    );

    return result.ok
      ? { ok: true, value: normalizeCollectionResponse<AdminUser>(result.value, { skip, limit }) }
      : result;
  }

  async create(payload: CreateAdminUserPayload): Promise<Either<Failure, AdminUser>> {
    return apiResponseToEither(
      await apiClient.post<AdminUser>(API_PATHS.ADMIN_USERS, payload)
    );
  }

  async update(id: string, payload: UpdateAdminUserPayload): Promise<Either<Failure, AdminUser>> {
    return apiResponseToEither(
      await apiClient.put<AdminUser>(API_PATHS.ADMIN_USER(id), payload)
    );
  }

  async deactivate(id: string): Promise<Either<Failure, void>> {
    return apiResponseToEither(
      await apiClient.delete<void>(API_PATHS.ADMIN_USER(id))
    );
  }
}
