import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
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
    return apiResponseToEither(
      await apiClient.get<AdminUserCollection>(API_PATHS.ADMIN_USERS, {
        skip: (page - 1) * limit,
        limit
      })
    );
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
